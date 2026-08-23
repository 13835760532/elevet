#include <Windows.h>
#include <mmsystem.h>

#include <algorithm>
#include <array>
#include <atomic>
#include <cctype>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <memory>
#include <string>
#include <thread>
#include <utility>

#include "aikit_biz_api.h"
#include "aikit_biz_builder.h"
#include "aikit_biz_config.h"
#include "aikit_constant.h"

#pragma comment(lib, "winmm.lib")

using namespace AIKIT;

namespace {

constexpr char kAbilityId[] = "e867a88f2";
constexpr DWORD kSampleRate = 16000;
constexpr WORD kChannels = 1;
constexpr WORD kBitsPerSample = 16;
constexpr DWORD kBufferBytes = 3200;  // 100 ms of 16 kHz, mono, 16-bit PCM.
constexpr size_t kBufferCount = 4;

struct Arguments {
  std::wstring config_path;
  std::wstring resource_dir;
  std::wstring work_dir;
};

std::string ToUtf8(const std::wstring& value) {
  if (value.empty()) return {};
  const int size = WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0, nullptr, nullptr);
  std::string result(size, '\0');
  WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), result.data(), size, nullptr, nullptr);
  return result;
}

std::string EscapeJson(const std::string& value) {
  std::string result;
  result.reserve(value.size());
  for (const char ch : value) {
    switch (ch) {
      case '\\': result += "\\\\"; break;
      case '"': result += "\\\""; break;
      case '\n': result += "\\n"; break;
      case '\r': result += "\\r"; break;
      case '\t': result += "\\t"; break;
      default: result += ch;
    }
  }
  return result;
}

void EmitStatus(const char* status, const std::string& message) {
  std::cout << "{\"type\":\"status\",\"status\":\"" << status
            << "\",\"message\":\"" << EscapeJson(message) << "\"}" << std::endl;
}

void EmitError(const std::string& message) {
  std::cout << "{\"type\":\"error\",\"message\":\""
            << EscapeJson(message) << "\"}" << std::endl;
}

void EmitDetected(const std::string& keyword) {
  std::cout << "{\"type\":\"detected\",\"keyword\":\""
            << EscapeJson(keyword) << "\"}" << std::endl;
}

std::string TrimIniToken(std::string value) {
  if (value.size() >= 3 && static_cast<unsigned char>(value[0]) == 0xEF &&
      static_cast<unsigned char>(value[1]) == 0xBB && static_cast<unsigned char>(value[2]) == 0xBF) {
    value.erase(0, 3);
  }
  const auto is_space = [](unsigned char ch) { return std::isspace(ch) != 0; };
  value.erase(value.begin(), std::find_if(value.begin(), value.end(), [&](char ch) {
    return !is_space(static_cast<unsigned char>(ch));
  }));
  value.erase(std::find_if(value.rbegin(), value.rend(), [&](char ch) {
    return !is_space(static_cast<unsigned char>(ch));
  }).base(), value.end());
  return value;
}

std::string LowerIniToken(std::string value) {
  std::transform(value.begin(), value.end(), value.begin(), [](unsigned char ch) {
    return static_cast<char>(std::tolower(ch));
  });
  return value;
}

std::string ReadIniValue(const std::wstring& config_path, const wchar_t* section, const wchar_t* key) {
  std::ifstream input(std::filesystem::path(config_path), std::ios::binary);
  if (!input) return {};

  const std::string target_section = LowerIniToken(ToUtf8(section));
  const std::string target_key = LowerIniToken(ToUtf8(key));
  std::string current_section;
  std::string line;
  while (std::getline(input, line)) {
    line = TrimIniToken(std::move(line));
    if (line.empty() || line[0] == ';' || line[0] == '#') continue;
    if (line.front() == '[' && line.back() == ']') {
      current_section = LowerIniToken(TrimIniToken(line.substr(1, line.size() - 2)));
      continue;
    }
    if (current_section != target_section) continue;
    const size_t separator = line.find('=');
    if (separator == std::string::npos) continue;
    const std::string parsed_key = LowerIniToken(TrimIniToken(line.substr(0, separator)));
    if (parsed_key != target_key) continue;
    return TrimIniToken(line.substr(separator + 1));
  }
  return {};
}

bool ParseArguments(int argc, wchar_t* argv[], Arguments* result) {
  for (int index = 1; index + 1 < argc; index += 2) {
    const std::wstring option = argv[index];
    const std::wstring value = argv[index + 1];
    if (option == L"--config") result->config_path = value;
    if (option == L"--resource-dir") result->resource_dir = value;
    if (option == L"--work-dir") result->work_dir = value;
  }
  return !result->config_path.empty() && !result->resource_dir.empty() && !result->work_dir.empty();
}

std::string ExtractJsonString(const std::string& value, const std::string& key) {
  const std::string prefix = "\"" + key + "\":\"";
  const size_t start = value.find(prefix);
  if (start == std::string::npos) return {};
  const size_t content_start = start + prefix.size();
  const size_t content_end = value.find('"', content_start);
  if (content_end == std::string::npos) return {};
  return value.substr(content_start, content_end - content_start);
}

void OnOutput(AIKIT_HANDLE*, const AIKIT_OutputData* output) {
  if (!output || !output->node || !output->node->value || output->node->len <= 0) return;
  const std::string payload(static_cast<const char*>(output->node->value), output->node->len);
  const std::string keyword = ExtractJsonString(payload, "keyword");
  if (!keyword.empty()) EmitDetected(keyword);
}

void OnEvent(AIKIT_HANDLE*, AIKIT_EVENT, const AIKIT_OutputEvent*) {}

void OnError(AIKIT_HANDLE*, int32_t error, const char* description) {
  EmitError("AIKit error " + std::to_string(error) + ": " + (description ? description : "unknown error"));
}

int RunWakeWord(const Arguments& arguments) {
  const std::string app_id = ReadIniValue(arguments.config_path, L"xfyun", L"app_id");
  const std::string api_key = ReadIniValue(arguments.config_path, L"xfyun", L"api_key");
  const std::string api_secret = ReadIniValue(arguments.config_path, L"xfyun", L"api_secret");
  const std::string threshold = ReadIniValue(arguments.config_path, L"wake", L"threshold");
  if (app_id.empty() || api_key.empty() || api_secret.empty()) {
    EmitError("Please fill app_id, api_key and api_secret in xfyun-awake.ini before enabling wake word.");
    return 2;
  }

  std::filesystem::create_directories(std::filesystem::path(arguments.work_dir));
  const std::string resource_dir = ToUtf8(arguments.resource_dir);
  const std::string work_dir = ToUtf8(arguments.work_dir);
  const std::string log_path = ToUtf8((std::filesystem::path(arguments.work_dir) / L"xfyun-awake.log").wstring());
  const std::string keyword_path = ToUtf8((std::filesystem::path(arguments.resource_dir).parent_path() / L"keyword.txt").wstring());

  EmitStatus("initializing", "Starting XFYUN AIKit wake word engine");
  AIKIT_Configurator::builder()
      .app()
      .appID(app_id.c_str())
      .apiKey(api_key.c_str())
      .apiSecret(api_secret.c_str())
      .workDir(work_dir.c_str())
      .resDir(resource_dir.c_str())
      .auth()
      .authType(0)
      .ability(kAbilityId)
      .log()
      .logMode(2)
      .logPath(log_path.c_str());

  int result = AIKIT_Init();
  if (result != 0) {
    EmitError("AIKIT_Init failed: " + std::to_string(result));
    return result;
  }

  AIKIT_Callbacks callbacks{OnOutput, OnEvent, OnError};
  result = AIKIT_RegisterAbilityCallback(kAbilityId, callbacks);
  if (result != 0) {
    EmitError("AIKIT_RegisterAbilityCallback failed: " + std::to_string(result));
    AIKIT_UnInit();
    return result;
  }

  result = AIKIT_EngineInit(kAbilityId, nullptr);
  if (result != 0) {
    EmitError("AIKIT_EngineInit failed: " + std::to_string(result));
    AIKIT_UnInit();
    return result;
  }

  AIKIT_CustomData keyword_data{};
  keyword_data.key = "key_word";
  keyword_data.index = 0;
  keyword_data.from = AIKIT_DATA_PTR_PATH;
  keyword_data.value = const_cast<char*>(keyword_path.c_str());
  keyword_data.len = static_cast<int>(keyword_path.size());
  result = AIKIT_LoadData(kAbilityId, &keyword_data);
  if (result != 0) {
    EmitError("AIKIT_LoadData failed: " + std::to_string(result));
    AIKIT_EngineUnInit(kAbilityId);
    AIKIT_UnInit();
    return result;
  }

  int indices[] = {0};
  result = AIKIT_SpecifyDataSet(kAbilityId, "key_word", indices, 1);
  if (result != 0) {
    EmitError("AIKIT_SpecifyDataSet failed: " + std::to_string(result));
    AIKIT_EngineUnInit(kAbilityId);
    AIKIT_UnInit();
    return result;
  }

  AIKIT_ParamBuilder* parameters = AIKIT_ParamBuilder::create();
  const std::string effective_threshold = threshold.empty() ? "0 0:999" : threshold;
  parameters->param("wdec_param_nCmThreshold", effective_threshold.c_str(), static_cast<uint32_t>(effective_threshold.size()));
  parameters->param("gramLoad", true);
  AIKIT_HANDLE* handle = nullptr;
  result = AIKIT_Start(kAbilityId, AIKIT_Builder::build(parameters), nullptr, &handle);
  if (result != 0 || !handle) {
    EmitError("AIKIT_Start failed: " + std::to_string(result));
    AIKIT_ParamBuilder::destroy(parameters);
    AIKIT_EngineUnInit(kAbilityId);
    AIKIT_UnInit();
    return result || -1;
  }

  WAVEFORMATEX format{};
  format.wFormatTag = WAVE_FORMAT_PCM;
  format.nChannels = kChannels;
  format.nSamplesPerSec = kSampleRate;
  format.wBitsPerSample = kBitsPerSample;
  format.nBlockAlign = kChannels * (kBitsPerSample / 8);
  format.nAvgBytesPerSec = format.nSamplesPerSec * format.nBlockAlign;

  HANDLE audio_event = CreateEventW(nullptr, FALSE, FALSE, nullptr);
  if (!audio_event) {
    const DWORD error = GetLastError();
    EmitError("Unable to create microphone event: " + std::to_string(error));
    AIKIT_End(handle);
    AIKIT_ParamBuilder::destroy(parameters);
    AIKIT_EngineUnInit(kAbilityId);
    AIKIT_UnInit();
    return static_cast<int>(error ? error : ERROR_GEN_FAILURE);
  }

  HWAVEIN wave_in = nullptr;
  struct AudioBuffer {
    std::array<char, kBufferBytes> data{};
    WAVEHDR header{};
  };
  std::array<AudioBuffer, kBufferCount> buffers{};
  std::array<bool, kBufferCount> prepared{};

  const auto cleanup_audio = [&]() {
    if (wave_in) {
      waveInStop(wave_in);
      waveInReset(wave_in);
      for (size_t index = 0; index < buffers.size(); ++index) {
        if (!prepared[index]) continue;
        waveInUnprepareHeader(wave_in, &buffers[index].header, sizeof(WAVEHDR));
        prepared[index] = false;
      }
      waveInClose(wave_in);
      wave_in = nullptr;
    }
    if (audio_event) {
      CloseHandle(audio_event);
      audio_event = nullptr;
    }
  };

  const auto cleanup_engine = [&]() {
    AIKIT_End(handle);
    AIKIT_ParamBuilder::destroy(parameters);
    AIKIT_EngineUnInit(kAbilityId);
    AIKIT_UnInit();
  };

  MMRESULT wave_result = waveInOpen(&wave_in, WAVE_MAPPER, &format, reinterpret_cast<DWORD_PTR>(audio_event), 0, CALLBACK_EVENT);
  if (wave_result != MMSYSERR_NOERROR) {
    EmitError("Unable to open microphone: " + std::to_string(wave_result));
    cleanup_audio();
    cleanup_engine();
    return static_cast<int>(wave_result);
  }

  for (size_t index = 0; index < buffers.size(); ++index) {
    auto& buffer = buffers[index];
    buffer.header.lpData = buffer.data.data();
    buffer.header.dwBufferLength = static_cast<DWORD>(buffer.data.size());
    const MMRESULT prepare_result = waveInPrepareHeader(wave_in, &buffer.header, sizeof(WAVEHDR));
    if (prepare_result != MMSYSERR_NOERROR) {
      EmitError("Unable to prepare microphone buffer: " + std::to_string(prepare_result));
      cleanup_audio();
      cleanup_engine();
      return static_cast<int>(prepare_result);
    }
    prepared[index] = true;

    const MMRESULT add_result = waveInAddBuffer(wave_in, &buffer.header, sizeof(WAVEHDR));
    if (add_result != MMSYSERR_NOERROR) {
      EmitError("Unable to queue microphone buffer: " + std::to_string(add_result));
      cleanup_audio();
      cleanup_engine();
      return static_cast<int>(add_result);
    }
  }

  const MMRESULT start_result = waveInStart(wave_in);
  if (start_result != MMSYSERR_NOERROR) {
    EmitError("Unable to start microphone: " + std::to_string(start_result));
    cleanup_audio();
    cleanup_engine();
    return static_cast<int>(start_result);
  }

  EmitStatus("listening", "Listening for wake word");
  const auto stop_requested = std::make_shared<std::atomic<bool>>(false);
  std::thread control_thread([stop_requested]() {
    std::string command;
    while (std::getline(std::cin, command)) {
      if (command == "stop") {
        stop_requested->store(true);
        break;
      }
    }
    stop_requested->store(true);
  });

  for (;;) {
    if (stop_requested->load()) break;
    if (WaitForSingleObject(audio_event, 100) != WAIT_OBJECT_0) continue;
    for (size_t index = 0; index < buffers.size(); ++index) {
      auto& buffer = buffers[index];
      if ((buffer.header.dwFlags & WHDR_DONE) == 0) continue;
      if (buffer.header.dwBytesRecorded > 0) {
        AIKIT_DataBuilder* input = AIKIT_DataBuilder::create();
        input->payload(AiAudio::get("wav")->encoding(AiAudio::ENCODING_PCM)
            ->sampleRate(kSampleRate)->channels(kChannels)->bitDepth(kBitsPerSample)
            ->data(buffer.data.data(), static_cast<int>(buffer.header.dwBytesRecorded))->valid());
        const int write_result = AIKIT_Write(handle, AIKIT_Builder::build(input));
        AIKIT_DataBuilder::destroy(input);
        if (write_result != 0) EmitError("AIKIT_Write failed: " + std::to_string(write_result));
      }

      const MMRESULT unprepare_result = waveInUnprepareHeader(wave_in, &buffer.header, sizeof(WAVEHDR));
      if (unprepare_result != MMSYSERR_NOERROR) {
        EmitError("Unable to release microphone buffer: " + std::to_string(unprepare_result));
        stop_requested->store(true);
        continue;
      }
      prepared[index] = false;
      buffer.header.dwBytesRecorded = 0;
      buffer.header.dwFlags = 0;

      const MMRESULT prepare_result = waveInPrepareHeader(wave_in, &buffer.header, sizeof(WAVEHDR));
      if (prepare_result != MMSYSERR_NOERROR) {
        EmitError("Unable to re-prepare microphone buffer: " + std::to_string(prepare_result));
        stop_requested->store(true);
        continue;
      }
      prepared[index] = true;

      const MMRESULT add_result = waveInAddBuffer(wave_in, &buffer.header, sizeof(WAVEHDR));
      if (add_result != MMSYSERR_NOERROR) {
        EmitError("Unable to re-queue microphone buffer: " + std::to_string(add_result));
        stop_requested->store(true);
      }
    }
  }

  cleanup_audio();
  cleanup_engine();
  // stdin 可能仍阻塞在 Electron 的管道读取，错误清理路径不能等待它导致助手挂死。
  if (control_thread.joinable()) control_thread.detach();
  return 0;
}

}  // namespace

int wmain(int argc, wchar_t* argv[]) {
  Arguments arguments;
  if (!ParseArguments(argc, argv, &arguments)) {
    EmitError("Missing --config, --resource-dir or --work-dir argument");
    return 1;
  }
  return RunWakeWord(arguments);
}

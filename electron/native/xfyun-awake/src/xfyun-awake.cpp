#include <Windows.h>
#include <mmsystem.h>

#include <array>
#include <filesystem>
#include <iostream>
#include <string>

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

std::string ReadIniValue(const std::wstring& config_path, const wchar_t* section, const wchar_t* key) {
  std::array<wchar_t, 2048> buffer{};
  GetPrivateProfileStringW(section, key, L"", buffer.data(), static_cast<DWORD>(buffer.size()), config_path.c_str());
  return ToUtf8(buffer.data());
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
  return content_end == std::string::npos ? {} : value.substr(content_start, content_end - content_start);
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
  HWAVEIN wave_in = nullptr;
  MMRESULT wave_result = waveInOpen(&wave_in, WAVE_MAPPER, &format, reinterpret_cast<DWORD_PTR>(audio_event), 0, CALLBACK_EVENT);
  if (wave_result != MMSYSERR_NOERROR) {
    EmitError("Unable to open microphone: " + std::to_string(wave_result));
    AIKIT_End(handle);
    AIKIT_ParamBuilder::destroy(parameters);
    AIKIT_EngineUnInit(kAbilityId);
    AIKIT_UnInit();
    CloseHandle(audio_event);
    return static_cast<int>(wave_result);
  }

  struct AudioBuffer {
    std::array<char, kBufferBytes> data{};
    WAVEHDR header{};
  };
  std::array<AudioBuffer, kBufferCount> buffers{};
  for (auto& buffer : buffers) {
    buffer.header.lpData = buffer.data.data();
    buffer.header.dwBufferLength = static_cast<DWORD>(buffer.data.size());
    waveInPrepareHeader(wave_in, &buffer.header, sizeof(WAVEHDR));
    waveInAddBuffer(wave_in, &buffer.header, sizeof(WAVEHDR));
  }

  waveInStart(wave_in);
  EmitStatus("listening", "Listening for wake word");
  for (;;) {
    if (WaitForSingleObject(audio_event, INFINITE) != WAIT_OBJECT_0) break;
    for (auto& buffer : buffers) {
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
      waveInUnprepareHeader(wave_in, &buffer.header, sizeof(WAVEHDR));
      buffer.header.dwBytesRecorded = 0;
      buffer.header.dwFlags = 0;
      waveInPrepareHeader(wave_in, &buffer.header, sizeof(WAVEHDR));
      waveInAddBuffer(wave_in, &buffer.header, sizeof(WAVEHDR));
    }
  }

  waveInStop(wave_in);
  waveInReset(wave_in);
  for (auto& buffer : buffers) {
    waveInUnprepareHeader(wave_in, &buffer.header, sizeof(WAVEHDR));
  }
  waveInClose(wave_in);
  CloseHandle(audio_event);
  AIKIT_End(handle);
  AIKIT_ParamBuilder::destroy(parameters);
  AIKIT_EngineUnInit(kAbilityId);
  AIKIT_UnInit();
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

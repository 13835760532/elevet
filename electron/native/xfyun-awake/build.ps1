param(
  [string]$Configuration = 'Release',
  [string]$Platform = 'x64'
)

$ErrorActionPreference = 'Stop'
$project = Join-Path $PSScriptRoot 'src\xfyun-awake.vcxproj'

if (-not (Get-Command msbuild -ErrorAction SilentlyContinue)) {
  throw 'MSBuild was not found. Run this script from a Visual Studio 2022 Developer PowerShell.'
}

msbuild $project "/p:Configuration=$Configuration" "/p:Platform=$Platform" '/m'

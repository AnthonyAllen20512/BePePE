<#!
.SYNOPSIS
Creates a scroll-ready WebP frame sequence from a source video.

.EXAMPLE
.\tools\extract-burn-motion-frames.ps1 `
  -InputVideo "C:\path\to\burn-motion.mp4" `
  -FfmpegPath "C:\path\to\ffmpeg.exe" `
  -Overwrite
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
  [string]$InputVideo,

  [ValidateRange(30, 60)]
  [int]$FrameCount = 49,

  [ValidateRange(1, 100)]
  [int]$WebpQuality = 66,

  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\assets\hero\burn-motion\frames"),

  [string]$FfmpegPath = "ffmpeg",

  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"

function Resolve-ExecutablePath {
  param([string]$PathOrCommand)

  if (Test-Path -LiteralPath $PathOrCommand -PathType Leaf) {
    return (Resolve-Path -LiteralPath $PathOrCommand).Path
  }

  $command = Get-Command $PathOrCommand -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  throw "Could not find $PathOrCommand. Install FFmpeg or pass -FfmpegPath with the absolute path to ffmpeg.exe."
}

$ffmpeg = Resolve-ExecutablePath $FfmpegPath
$ffprobe = if (Split-Path -Parent $ffmpeg) {
  Join-Path (Split-Path -Parent $ffmpeg) "ffprobe.exe"
} else {
  "ffprobe"
}

if (-not (Test-Path -LiteralPath $ffprobe -PathType Leaf) -and -not (Get-Command $ffprobe -ErrorAction SilentlyContinue)) {
  throw "Could not find ffprobe next to $ffmpeg."
}

$resolvedInput = (Resolve-Path -LiteralPath $InputVideo).Path
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

$existingFrames = @(Get-ChildItem -LiteralPath $resolvedOutput -Filter "frame_*.webp" -File)
if ($existingFrames.Count -gt 0 -and -not $Overwrite) {
  throw "Output already contains $($existingFrames.Count) frames. Run again with -Overwrite to replace only frame_*.webp files."
}

if ($Overwrite) {
  $existingFrames | Remove-Item -Force
}

$probeJson = & $ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames,width,height -of json -- $resolvedInput
$stream = ($probeJson | ConvertFrom-Json).streams[0]
$sourceFrameCount = [int]$stream.nb_read_frames

if ($sourceFrameCount -lt $FrameCount) {
  throw "The input has only $sourceFrameCount frames, which is less than the requested $FrameCount frames."
}

# Choose evenly spaced real source frames, including the first and last frame.
$frameIndices = 0..($FrameCount - 1) | ForEach-Object {
  [math]::Round($_ * ($sourceFrameCount - 1) / ($FrameCount - 1))
} | Select-Object -Unique

$selectExpression = ($frameIndices | ForEach-Object { "eq(n\,$_ )".Replace(" ", "") }) -join "+"
$outputPattern = Join-Path $resolvedOutput "frame_%03d.webp"

& $ffmpeg -hide_banner -loglevel error -y -i $resolvedInput -an `
  -vf "select='$selectExpression'" -fps_mode vfr `
  -c:v libwebp -q:v $WebpQuality -compression_level 6 -preset picture `
  $outputPattern

$generatedFrames = @(Get-ChildItem -LiteralPath $resolvedOutput -Filter "frame_*.webp" -File | Sort-Object Name)
if ($generatedFrames.Count -ne $FrameCount) {
  throw "Expected $FrameCount frames but generated $($generatedFrames.Count)."
}

$stats = $generatedFrames | Measure-Object -Property Length -Average -Maximum -Sum
[pscustomobject]@{
  OutputDirectory = $resolvedOutput
  FrameCount = $generatedFrames.Count
  Resolution = "$($stream.width)x$($stream.height)"
  AverageKilobytes = [math]::Round($stats.Average / 1KB, 1)
  MaximumKilobytes = [math]::Round($stats.Maximum / 1KB, 1)
  TotalMegabytes = [math]::Round($stats.Sum / 1MB, 2)
}

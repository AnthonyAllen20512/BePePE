param(
  [string]$Source = "assets/design-kit/burnepep-web-slices-v2/transparent_png/01_shared/B02_header-crown_alpha.png",
  [string]$OutputDirectory = "assets/icons"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

function New-CrownBitmap([int]$Size) {
  $sourceImage = [System.Drawing.Image]::FromFile((Resolve-Path $Source))
  try {
    $canvas = New-Object System.Drawing.Bitmap $Size, $Size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

      $padding = [int][Math]::Round($Size * 0.08)
      $available = $Size - (2 * $padding)
      $scale = [Math]::Min($available / $sourceImage.Width, $available / $sourceImage.Height)
      $width = [int][Math]::Round($sourceImage.Width * $scale)
      $height = [int][Math]::Round($sourceImage.Height * $scale)
      $x = [int][Math]::Round(($Size - $width) / 2)
      $y = [int][Math]::Round(($Size - $height) / 2)
      $graphics.DrawImage($sourceImage, (New-Object System.Drawing.Rectangle $x, $y, $width, $height))
      return $canvas
    } finally {
      $graphics.Dispose()
    }
  } finally {
    $sourceImage.Dispose()
  }
}

function Get-PngBytes([System.Drawing.Bitmap]$Bitmap) {
  $stream = New-Object System.IO.MemoryStream
  try {
    $Bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
    return $stream.ToArray()
  } finally {
    $stream.Dispose()
  }
}

$iconSizes = @(16, 32, 48, 64)
$iconFrames = @()
foreach ($size in $iconSizes) {
  $bitmap = New-CrownBitmap $size
  try {
    $iconFrames += ,@($size, (Get-PngBytes $bitmap))
    if ($size -eq 32) {
      $bitmap.Save((Join-Path $OutputDirectory "burnepep-crown-32.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    }
  } finally {
    $bitmap.Dispose()
  }
}

$touchIcon = New-CrownBitmap 180
try {
  $touchIcon.Save((Join-Path $OutputDirectory "burnepep-crown-180.png"), [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $touchIcon.Dispose()
}

$icoPath = Join-Path $OutputDirectory "burnepep-crown.ico"
$writer = New-Object System.IO.BinaryWriter([System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create))
try {
  $writer.Write([UInt16]0)
  $writer.Write([UInt16]1)
  $writer.Write([UInt16]$iconFrames.Count)

  $offset = 6 + (16 * $iconFrames.Count)
  foreach ($frame in $iconFrames) {
    $size = $frame[0]
    $bytes = $frame[1]
    $writer.Write([byte]$size)
    $writer.Write([byte]$size)
    $writer.Write([byte]0)
    $writer.Write([byte]0)
    $writer.Write([UInt16]1)
    $writer.Write([UInt16]32)
    $writer.Write([UInt32]$bytes.Length)
    $writer.Write([UInt32]$offset)
    $offset += $bytes.Length
  }

  foreach ($frame in $iconFrames) {
    $writer.Write([byte[]]$frame[1])
  }
} finally {
  $writer.Dispose()
}

Write-Output "Generated favicon assets in $OutputDirectory"

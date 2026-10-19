Add-Type -AssemblyName System.Drawing

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$srcPath = Join-Path $projectRoot "public\logo.png"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source logo not found at $srcPath"
    exit 1
}

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source image loaded: $($srcBmp.Width)x$($srcBmp.Height)"

# Function to resize with high quality bicubic interpolation
function Resize-Image {
    param(
        [System.Drawing.Bitmap]$source,
        [int]$width,
        [int]$height,
        [int]$cornerRadius = 0
    )

    $destBmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($destBmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.Clear([System.Drawing.Color]::Transparent)

    if ($cornerRadius -gt 0) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $cornerRadius * 2
        $rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
        
        $path.AddArc(0, 0, $d, $d, 180, 90)
        $path.AddArc($width - $d, 0, $d, $d, 270, 90)
        $path.AddArc($width - $d, $height - $d, $d, $d, 0, 90)
        $path.AddArc(0, $height - $d, $d, $d, 90, 90)
        $path.CloseFigure()

        $g.SetClip($path)
    }

    # Fill white background since logo has white background
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillRectangle($brush, 0, 0, $width, $height)
    $brush.Dispose()

    # Draw the source image
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $g.DrawImage($source, $destRect, 0, 0, $source.Width, $source.Height, [System.Drawing.GraphicsUnit]::Pixel)

    $g.Dispose()
    return $destBmp
}

# 1. Generate crisp square PNGs for search engines, browsers, and mobile devices
$sizes = @{
    "favicon-16x16.png" = 16
    "favicon-32x32.png" = 32
    "favicon-48x48.png" = 48
    "favicon-96x96.png" = 96
    "apple-touch-icon.png" = 180
    "logo-192.png" = 192
    "logo-512.png" = 512
}

foreach ($name in $sizes.Keys) {
    $sz = $sizes[$name]
    # For standard search engines and web favicons, full square with crisp white background is optimal
    # so search engines (like Google) and mobile OS can display or circle-mask the icon cleanly without corner clipping.
    $resized = Resize-Image -source $srcBmp -width $sz -height $sz -cornerRadius 0
    $outPath = Join-Path $projectRoot "public\$name"
    $resized.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $resized.Dispose()
    Write-Host "Created $name ($sz x $sz)"
}

# 2. Create true multi-resolution favicon.ico containing 48x48, 32x32, and 16x16 frames
# Googlebot-Image and modern browsers strictly look for 48x48 or multi-res ICO
$icoPngSizes = @(48, 32, 16)
$icoEntries = @()

foreach ($sz in $icoPngSizes) {
    $pngPath = Join-Path $projectRoot "public\favicon-${sz}x${sz}.png"
    $bytes = [System.IO.File]::ReadAllBytes($pngPath)
    $icoEntries += [PSCustomObject]@{
        Width = [byte]$sz
        Height = [byte]$sz
        Bytes = $bytes
    }
}

$ms = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter($ms)

# Write ICO Header
$bw.Write([uint16]0)                  # Reserved (must be 0)
$bw.Write([uint16]1)                  # Resource type: 1 = ICO
$bw.Write([uint16]$icoEntries.Count)  # Image count (3)

# Calculate image data offset
$dataOffset = 6 + ($icoEntries.Count * 16)

# Write Directory Entries
foreach ($entry in $icoEntries) {
    $bw.Write([byte]$entry.Width)                    # Width
    $bw.Write([byte]$entry.Height)                   # Height
    $bw.Write([byte]0)                               # Colors (0 for truecolor/PNG)
    $bw.Write([byte]0)                               # Reserved
    $bw.Write([uint16]1)                             # Color planes
    $bw.Write([uint16]32)                            # Bits per pixel
    $bw.Write([uint32]$entry.Bytes.Length)           # Size of image data
    $bw.Write([uint32]$dataOffset)                   # Offset of image data
    $dataOffset += $entry.Bytes.Length
}

# Write PNG byte arrays
foreach ($entry in $icoEntries) {
    $bw.Write($entry.Bytes)
}

$bw.Flush()
$icoPath = Join-Path $projectRoot "public\favicon.ico"
[System.IO.File]::WriteAllBytes($icoPath, $ms.ToArray())
$bw.Close()
$ms.Close()
Write-Host "Created modern multi-res favicon.ico (48x48, 32x32, 16x16, size: $((Get-Item $icoPath).Length) bytes)"

# 3. Create SVG favicon embedding the 192x192 PNG as base64
$png192Path = Join-Path $projectRoot "public\logo-192.png"
$bytes192 = [System.IO.File]::ReadAllBytes($png192Path)
$b64 = [Convert]::ToBase64String($bytes192)

$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="100%" height="100%">
  <rect width="192" height="192" rx="38" ry="38" fill="#ffffff"/>
  <image href="data:image/png;base64,$b64" width="192" height="192" x="0" y="0"/>
</svg>
"@

$svgPath = Join-Path $projectRoot "public\favicon.svg"
[System.IO.File]::WriteAllText($svgPath, $svgContent, [System.Text.Encoding]::UTF8)
Write-Host "Updated public/favicon.svg"

$srcBmp.Dispose()
Write-Host "All favicons generated successfully!"

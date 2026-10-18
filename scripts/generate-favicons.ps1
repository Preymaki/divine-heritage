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

# 1. Generate PNGs
$sizes = @{
    "favicon-16x16.png" = 16
    "favicon-32x32.png" = 32
    "favicon-48x48.png" = 48
    "apple-touch-icon.png" = 180
    "logo-192.png" = 192
    "logo-512.png" = 512
}

foreach ($name in $sizes.Keys) {
    $sz = $sizes[$name]
    $radius = [int][Math]::Round($sz * 0.16)
    $resized = Resize-Image -source $srcBmp -width $sz -height $sz -cornerRadius $radius
    $outPath = Join-Path $projectRoot "public\$name"
    $resized.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $resized.Dispose()
    Write-Host "Created $name ($sz x $sz)"
}

# Also generate a square version of 32 and 16 without rounded corners for standard crisp favicon
$fav32 = Resize-Image -source $srcBmp -width 32 -height 32 -cornerRadius 0
$fav16 = Resize-Image -source $srcBmp -width 16 -height 16 -cornerRadius 0
$fav48 = Resize-Image -source $srcBmp -width 48 -height 48 -cornerRadius 0

# Create favicon.ico (can contain 32x32 icon)
$hIcon = $fav32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$icoPath = Join-Path $projectRoot "public\favicon.ico"
$fs = [System.IO.File]::Create($icoPath)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
Write-Host "Created favicon.ico"

# Create SVG favicon embedding the 192x192 PNG as base64
$png192Path = Join-Path $projectRoot "public\logo-192.png"
$bytes192 = [System.IO.File]::ReadAllBytes($png192Path)
$b64 = [Convert]::ToBase64String($bytes192)

$svgContent = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" width="100%" height="100%">
  <defs>
    <clipPath id="squircle">
      <rect width="192" height="192" rx="32" ry="32"/>
    </clipPath>
  </defs>
  <rect width="192" height="192" rx="32" ry="32" fill="#ffffff"/>
  <g clip-path="url(#squircle)">
    <image href="data:image/png;base64,$b64" width="192" height="192" x="0" y="0"/>
  </g>
</svg>
"@

$svgPath = Join-Path $projectRoot "public\favicon.svg"
[System.IO.File]::WriteAllText($svgPath, $svgContent, [System.Text.Encoding]::UTF8)
Write-Host "Updated public/favicon.svg"

$fav32.Dispose()
$fav16.Dispose()
$fav48.Dispose()
$srcBmp.Dispose()

Write-Host "All favicons generated successfully!"

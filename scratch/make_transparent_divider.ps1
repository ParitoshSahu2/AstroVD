Add-Type -AssemblyName System.Drawing

$srcPath = 'C:/Users/parit/.gemini/antigravity-ide/brain/5e98aaaa-1a57-41d6-aac6-7df23bef36fa/.user_uploaded/media_1792134108053.png'
$outPath = 'C:/Users/parit/OneDrive/Desktop/Final Astrology/frontend/public/ornaments/section_divider.png'

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
$dst = New-Object System.Drawing.Bitmap($src.Width, $src.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Crop bounds detection
$minX = $src.Width
$maxX = 0
$minY = $src.Height
$maxY = 0

for ($y = 0; $y -lt $src.Height; $y++) {
    for ($x = 0; $x -lt $src.Width; $x++) {
        $c = $src.GetPixel($x, $y)
        $r = [int]$c.R
        $g = [int]$c.G
        $b = [int]$c.B
        
        # Gold is warm: R > G > B, with R - B significantly positive
        # In grey/white checkerboard: R, G, B are nearly equal (diff < 10)
        $diff = $r - $b
        $diff2 = $r - $g

        if ($diff -gt 15 -and $r -gt 100 -and $r -lt 245) {
            # Gold pixel!
            # Smooth opacity based on warmth/saturation
            $alpha = [int][Math]::Min(255, [Math]::Max(0, ($diff - 12) * 8))
            if ($alpha -gt 255) { $alpha = 255 }
            
            # Use pristine sacred gold: #C29B62 -> R=194, G=155, B=98 or original
            $newColor = [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b)
            $dst.SetPixel($x, $y, $newColor)

            if ($alpha -gt 40) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        } else {
            # Background checkerboard -> 100% Transparent
            $dst.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

Write-Host "Bounds: X: $minX to $maxX, Y: $minY to $maxY"

# Crop to actual ornament bounds with a little padding
$paddingY = 4
$cropY = [Math]::Max(0, $minY - $paddingY)
$cropH = [Math]::Min($src.Height - $cropY, ($maxY - $minY) + ($paddingY * 2))
$cropX = 0
$cropW = $src.Width

$cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $dst.Clone($cropRect, $dst.PixelFormat)

$cropped.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved transparent divider to $outPath (Size: $cropW x $cropH)"

$src.Dispose()
$dst.Dispose()
$cropped.Dispose()

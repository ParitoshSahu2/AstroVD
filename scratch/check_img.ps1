Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/parit/.gemini/antigravity-ide/brain/5e98aaaa-1a57-41d6-aac6-7df23bef36fa/.user_uploaded/media_1792134108053.png')
Write-Host "Width: $($img.Width) Height: $($img.Height)"
Write-Host "PixelFormat: $($img.PixelFormat)"
$c1 = $img.GetPixel(10, 10)
Write-Host "Corner(10,10): A=$($c1.A) R=$($c1.R) G=$($c1.G) B=$($c1.B)"
$c2 = $img.GetPixel([int]($img.Width/2), [int]($img.Height/2))
Write-Host "Center: A=$($c2.A) R=$($c2.R) G=$($c2.G) B=$($c2.B)"
$img.Dispose()

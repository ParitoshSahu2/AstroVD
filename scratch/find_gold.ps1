Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile('C:/Users/parit/.gemini/antigravity-ide/brain/5e98aaaa-1a57-41d6-aac6-7df23bef36fa/.user_uploaded/media_1792134108053.png')

# Let's inspect along a vertical line near the center, e.g. x = 512, y from 100 to 200
for ($y = 140; $y -le 180; $y += 5) {
    $c = $img.GetPixel(512, $y)
    Write-Host "y=$y : R=$($c.R) G=$($c.G) B=$($c.B)"
}

$img.Dispose()

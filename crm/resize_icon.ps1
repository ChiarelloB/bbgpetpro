
Add-Type -AssemblyName System.Drawing

$sourcePath = "build\icon_temp.ico"
$destPath = "build\icon.ico"

try {
    # Load original image
    $img = [System.Drawing.Image]::FromFile($sourcePath)
    
    # Create new 256x256 bitmap
    $newImg = New-Object System.Drawing.Bitmap(256, 256)
    $graph = [System.Drawing.Graphics]::FromImage($newImg)
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    # Draw resized image
    $graph.DrawImage($img, 0, 0, 256, 256)
    
    # Convert to Icon
    $hIcon = $newImg.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($hIcon)
    
    # Save
    $fs = New-Object System.IO.FileStream($destPath, "Create")
    $icon.Save($fs)
    $fs.Close()
    
    Write-Host "Icon resized successfully to 256x256"
}
catch {
    Write-Error "Failed to resize icon: $_"
    exit 1
}
finally {
    if ($img) { $img.Dispose() }
    if ($newImg) { $newImg.Dispose() }
    if ($graph) { $graph.Dispose() }
    if ($fs) { $fs.Close() }
}

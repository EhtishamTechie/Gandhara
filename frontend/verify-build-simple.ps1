# Build Verification Script - Simple Version
Write-Host "`n========================================"
Write-Host "VIDEO DEPLOYMENT VERIFICATION"
Write-Host "========================================`n"

# Check if dist folder exists
if (-Not (Test-Path "dist")) {
    Write-Host "ERROR: dist folder not found!" -ForegroundColor Red
    Write-Host "Run 'npm run build' first" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: dist folder found`n" -ForegroundColor Green

# Check for ProductVideos folder in dist
if (-Not (Test-Path "dist\ProductVideos")) {
    Write-Host "ERROR: ProductVideos folder missing in dist!" -ForegroundColor Red
    Write-Host "Copying videos manually..." -ForegroundColor Yellow
    
    if (Test-Path "public\ProductVideos") {
        Copy-Item -Path "public\ProductVideos" -Destination "dist" -Recurse -Force
        Write-Host "OK: Videos copied successfully`n" -ForegroundColor Green
    } else {
        Write-Host "ERROR: public\ProductVideos not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "OK: ProductVideos folder found in dist`n" -ForegroundColor Green
}

# List videos in dist
Write-Host "Videos in dist folder:" -ForegroundColor Cyan
$videos = Get-ChildItem "dist\ProductVideos" -Filter "*.mp4"
$totalSize = 0

foreach ($video in $videos) {
    $sizeMB = [math]::Round($video.Length / 1MB, 2)
    $totalSize += $video.Length
    Write-Host "   - $($video.Name) - $sizeMB MB" -ForegroundColor Green
}

$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "`nTotal video size: $totalSizeMB MB" -ForegroundColor Cyan

# Check dist folder total size
$distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
$distSizeMB = [math]::Round($distSize / 1MB, 2)
Write-Host "Total dist size: $distSizeMB MB`n" -ForegroundColor Cyan

# Check for other required assets
Write-Host "Checking other assets:" -ForegroundColor Cyan

if (Test-Path "dist\GandharaImages") {
    $imageCount = (Get-ChildItem "dist\GandharaImages" -Recurse -File).Count
    Write-Host "   OK: GandharaImages found ($imageCount files)" -ForegroundColor Green
} else {
    Write-Host "   WARNING: GandharaImages folder missing" -ForegroundColor Yellow
}

if (Test-Path "dist\TourImages") {
    $tourCount = (Get-ChildItem "dist\TourImages" -Recurse -File).Count
    Write-Host "   OK: TourImages found ($tourCount files)" -ForegroundColor Green
} else {
    Write-Host "   WARNING: TourImages folder missing" -ForegroundColor Yellow
}

# Check for redirect files
Write-Host "`nChecking SPA routing config files:" -ForegroundColor Cyan

if (Test-Path "dist\_redirects") {
    Write-Host "   OK: _redirects file found (Netlify)" -ForegroundColor Green
} else {
    Write-Host "   WARNING: _redirects file missing (needed for Netlify)" -ForegroundColor Yellow
}

if (Test-Path "dist\.htaccess") {
    Write-Host "   OK: .htaccess file found (Apache/cPanel)" -ForegroundColor Green
} else {
    Write-Host "   WARNING: .htaccess file missing (needed for Apache)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================"
Write-Host "SUMMARY"
Write-Host "========================================"

if ($distSizeMB -gt 100) {
    Write-Host "WARNING: Dist folder is $distSizeMB MB" -ForegroundColor Yellow
    Write-Host "Some hosting platforms have size limits" -ForegroundColor Yellow
}

Write-Host "`nVerification complete!" -ForegroundColor Green
Write-Host "Next step: npm run preview (test locally)" -ForegroundColor White
Write-Host "Then deploy to production`n" -ForegroundColor White

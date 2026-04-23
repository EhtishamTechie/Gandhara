# Video Deployment Verification Script
# Run this after building: npm run build

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "VIDEO DEPLOYMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if dist folder exists
if (-Not (Test-Path "dist")) {
    Write-Host "❌ ERROR: dist folder not found!" -ForegroundColor Red
    Write-Host "   Run 'npm run build' first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ dist folder found`n" -ForegroundColor Green

# Check for ProductVideos folder in dist
if (-Not (Test-Path "dist\ProductVideos")) {
    Write-Host "❌ ERROR: ProductVideos folder missing in dist!" -ForegroundColor Red
    Write-Host "   Copying videos manually..." -ForegroundColor Yellow
    
    if (Test-Path "public\ProductVideos") {
        Copy-Item -Path "public\ProductVideos" -Destination "dist" -Recurse -Force
        Write-Host "✅ Videos copied successfully`n" -ForegroundColor Green
    } else {
        Write-Host "❌ ERROR: public\ProductVideos not found!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ ProductVideos folder found in dist`n" -ForegroundColor Green
}

# List videos in dist
Write-Host "📹 Videos in dist folder:" -ForegroundColor Cyan
$videos = Get-ChildItem "dist\ProductVideos" -Filter "*.mp4"
$totalSize = 0

foreach ($video in $videos) {
    $sizeMB = [math]::Round($video.Length / 1MB, 2)
    $totalSize += $video.Length
    Write-Host "   ✓ $($video.Name) - $sizeMB MB" -ForegroundColor Green
}

$totalSizeMB = [math]::Round($totalSize / 1MB, 2)
Write-Host "`n📊 Total video size: $totalSizeMB MB" -ForegroundColor Cyan

# Check dist folder total size
$distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
$distSizeMB = [math]::Round($distSize / 1MB, 2)
Write-Host "📦 Total dist size: $distSizeMB MB`n" -ForegroundColor Cyan

# Check for other required assets
Write-Host "🔍 Checking other assets:" -ForegroundColor Cyan

if (Test-Path "dist\GandharaImages") {
    $imageCount = (Get-ChildItem "dist\GandharaImages" -Recurse -File).Count
    Write-Host "   ✅ GandharaImages found ($imageCount files)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  GandharaImages folder missing" -ForegroundColor Yellow
}

if (Test-Path "dist\TourImages") {
    $tourCount = (Get-ChildItem "dist\TourImages" -Recurse -File).Count
    Write-Host "   ✅ TourImages found ($tourCount files)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  TourImages folder missing" -ForegroundColor Yellow
}

# Warnings and recommendations
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($distSizeMB -gt 100) {
    Write-Host "⚠️  WARNING: Dist folder is $distSizeMB MB" -ForegroundColor Yellow
    Write-Host "   Some hosting platforms have size limits (Netlify: 200MB, Vercel: 100MB)" -ForegroundColor Yellow
    Write-Host "   Consider compressing videos or using external hosting`n" -ForegroundColor Yellow
}

if ($totalSizeMB -gt 50) {
    Write-Host "💡 TIP: Consider using a CDN for videos:" -ForegroundColor Cyan
    Write-Host "   • Cloudinary (Free: 25GB)" -ForegroundColor White
    Write-Host "   • Bunny.net (Cheap: `$1/month)" -ForegroundColor White
    Write-Host "   • AWS S3 + CloudFront`n" -ForegroundColor White
}

Write-Host "✅ Verification complete!" -ForegroundColor Green
Write-Host "   Next step: npm run preview (test locally)" -ForegroundColor White
Write-Host "   Then deploy to production`n" -ForegroundColor White

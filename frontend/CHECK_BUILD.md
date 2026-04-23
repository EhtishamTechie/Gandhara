# Build Verification Checklist

## After running `npm run build`, verify the following:

### 1. Check if videos are in the dist folder:
```powershell
# Windows PowerShell
Get-ChildItem "dist\ProductVideos" -Recurse | Select-Object Name, Length
```

Expected output: You should see all 5 video files

### 2. Check dist folder size:
```powershell
# Windows PowerShell
"{0:N2} MB" -f ((Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB)
```

Expected: ~130-150 MB (with videos)

### 3. Test the build locally:
```powershell
npm run preview
```

Then open http://localhost:4173 and check if videos play

---

## Common Issues and Solutions

### Issue: Videos not in dist folder after build
**Solution:** 
- Vite should automatically copy the `public` folder to `dist`
- If not, manually copy: `Copy-Item -Path "public\*" -Destination "dist" -Recurse -Force`

### Issue: Hosting platform times out during deployment
**Solution:** 
- File size is too large (130MB+)
- Consider using external video hosting (Cloudinary, Bunny.net, etc.)
- Or compress videos before deployment

### Issue: Videos show 404 in production
**Solution:**
- Check if base URL is correct in vite.config.js
- Verify hosting platform copied all files from dist folder
- Check browser console for actual URL being requested

---

## Video Compression (Optional)

If you want to reduce file sizes:

```powershell
# Install ffmpeg first: winget install ffmpeg
# Then compress videos:
ffmpeg -i "Gandhara Art Artisans.mp4" -vcodec h264 -acodec aac -b:v 1M "Gandhara_Art_Artisans_compressed.mp4"
```

This can reduce 58MB video to ~15-20MB with minimal quality loss.

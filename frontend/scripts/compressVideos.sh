#!/bin/bash
# Video Compression Script for Production
# Compresses videos to ~5MB or less using H.265 codec

VIDEO_DIR="/var/www/Gandhara/frontend/public/ProductVideos"
BACKUP_DIR="$VIDEO_DIR/original_backups"
TARGET_SIZE_MB=5
TARGET_SIZE_KB=$((TARGET_SIZE_MB * 1024))

echo "🎬 Production Video Compression"
echo "================================"
echo ""
echo "Target: Compress each video to ~${TARGET_SIZE_MB}MB"
echo "Directory: $VIDEO_DIR"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"
echo "✅ Backup directory: $BACKUP_DIR"
echo ""

# Find all mp4 files
cd "$VIDEO_DIR"
videos=(*.mp4)

if [ ${#videos[@]} -eq 0 ]; then
    echo "❌ No MP4 files found"
    exit 1
fi

echo "📋 Found ${#videos[@]} videos to compress"
echo ""

total_original=0
total_compressed=0

for video in "${videos[@]}"; do
    if [[ "$video" == "original_backups" ]]; then
        continue
    fi
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📹 Processing: $video"
    
    # Get original size
    original_size=$(stat -f%z "$video" 2>/dev/null || stat -c%s "$video")
    original_mb=$(echo "scale=2; $original_size / 1024 / 1024" | bc)
    echo "   Original: ${original_mb} MB"
    
    # Get video duration
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$video")
    duration_int=$(echo "$duration" | cut -d'.' -f1)
    
    # Calculate bitrate (target size in KB * 8 / duration in seconds)
    bitrate=$(echo "scale=0; ($TARGET_SIZE_KB * 8) / $duration_int" | bc)
    echo "   Target bitrate: ${bitrate}k"
    
    # Backup original
    echo "   💾 Backing up..."
    cp "$video" "$BACKUP_DIR/"
    
    # Compress
    echo "   🔧 Compressing..."
    temp_file="${video%.mp4}_temp.mp4"
    
    ffmpeg -i "$video" \
        -c:v libx264 \
        -preset slow \
        -crf 28 \
        -b:v ${bitrate}k \
        -maxrate ${bitrate}k \
        -bufsize $((bitrate * 2))k \
        -vf "scale=1280:-2" \
        -c:a aac \
        -b:a 96k \
        -movflags +faststart \
        -y "$temp_file" \
        2>&1 | grep -E "frame=|size=|time=" | tail -1
    
    if [ $? -eq 0 ]; then
        # Replace original with compressed
        mv "$temp_file" "$video"
        
        # Get new size
        new_size=$(stat -f%z "$video" 2>/dev/null || stat -c%s "$video")
        new_mb=$(echo "scale=2; $new_size / 1024 / 1024" | bc)
        saved=$(echo "scale=2; $original_mb - $new_mb" | bc)
        percent=$(echo "scale=1; (($original_size - $new_size) / $original_size) * 100" | bc)
        
        echo "   ✅ Compressed: ${new_mb} MB"
        echo "   💾 Saved: ${saved} MB (${percent}%)"
        
        total_original=$((total_original + original_size))
        total_compressed=$((total_compressed + new_size))
    else
        echo "   ❌ Compression failed"
        rm -f "$temp_file"
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 COMPRESSION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

total_original_mb=$(echo "scale=2; $total_original / 1024 / 1024" | bc)
total_compressed_mb=$(echo "scale=2; $total_compressed / 1024 / 1024" | bc)
total_saved_mb=$(echo "scale=2; $total_original_mb - $total_compressed_mb" | bc)
total_percent=$(echo "scale=1; (($total_original - $total_compressed) / $total_original) * 100" | bc)

echo "Videos processed: ${#videos[@]}"
echo "Original size: ${total_original_mb} MB"
echo "Compressed size: ${total_compressed_mb} MB"
echo "Space saved: ${total_saved_mb} MB (${total_percent}%)"
echo "Backups: $BACKUP_DIR"
echo ""
echo "✅ Video compression complete!"

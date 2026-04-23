#!/usr/bin/env python3

# Read the file
with open('ProductDetail.jsx', 'r') as f:
    content = f.read()

# Find and replace the handleMouseMove function and magnifier div
old_mouse_move = '''  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMagnifierPosition({ x, y });
    setCursorPosition({ x: e.clientX - left, y: e.clientY - top });
  };'''

new_mouse_move = '''  const handleMouseMove = (e) => {
    const elem = e.currentTarget;
    const { left, top, width, height } = elem.getBoundingClientRect();
    
    // Calculate position relative to the image container
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Calculate percentage for background position
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;
    
    setMagnifierPosition({ x: xPercent, y: yPercent });
    setCursorPosition({ x, y });
  };'''

content = content.replace(old_mouse_move, new_mouse_move)

# Replace the magnifier lens style
old_magnifier = '''          {/* Magnifier Lens */}
          {showMagnifier && (
            <div
              className="absolute pointer-events-none border-4 border-white rounded-full shadow-2xl bg-white"
              style={{
                width: '150px',
                height: '150px',
                left: `${cursorPosition.x - 75}px`,
                top: `${cursorPosition.y - 75}px`,
                backgroundImage: `url(${processedImages[currentImage]})`,
                backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                backgroundSize: '250%',
                backgroundRepeat: 'no-repeat',
                zIndex: 1000
              }}
            />
          )}'''

new_magnifier = '''          {/* Magnifier Lens */}
          {showMagnifier && (
            <div
              className="absolute pointer-events-none border-4 border-white rounded-full shadow-2xl overflow-hidden"
              style={{
                width: '180px',
                height: '180px',
                left: `${cursorPosition.x - 90}px`,
                top: `${cursorPosition.y - 90}px`,
                zIndex: 1000
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${processedImages[currentImage]})`,
                  backgroundPosition: `${magnifierPosition.x}% ${magnifierPosition.y}%`,
                  backgroundSize: '300%',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            </div>
          )}'''

content = content.replace(old_magnifier, new_magnifier)

# Write back
with open('ProductDetail.jsx', 'w') as f:
    f.write(content)

print("✅ Magnifier alignment fixed!")

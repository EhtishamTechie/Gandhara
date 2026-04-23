#!/usr/bin/env python3

# Read the file
with open('ProductDetail.jsx', 'r') as f:
    lines = f.readlines()

# New ImageGallery component with magnifier (lines 58-189)
new_component = '''// Image Gallery Component with Magnifier
const ImageGallery = ({ images, productTitle }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const imageArray = Array.isArray(images) ? images : [images];
  const processedImages = imageArray.map(img => getImagePath(img));

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % processedImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + processedImages.length) % processedImages.length);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMagnifierPosition({ x, y });
    setCursorPosition({ x: e.clientX - left, y: e.clientY - top });
  };

  return (
    <div className="space-y-4">
      {/* Main Image with Magnifier */}
      <div className="relative aspect-square bg-[#1E293B] rounded-xl overflow-hidden group">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full relative"
          onMouseEnter={() => setShowMagnifier(true)}
          onMouseLeave={() => setShowMagnifier(false)}
          onMouseMove={handleMouseMove}
          style={{ cursor: showMagnifier ? 'none' : 'default' }}
        >
          <WatermarkedImage
            src={processedImages[currentImage]}
            alt={`${productTitle} - Image ${currentImage + 1}`}
            className="w-full h-full object-cover object-center"
          />

          {/* Magnifier Lens */}
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
          )}
        </motion.div>

        {/* Navigation buttons */}
        {processedImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-[#0F172A]/70 hover:bg-[#0F172A]/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#0F172A]/70 hover:bg-[#0F172A]/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Image indicator */}
        {processedImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1 z-10">
            {processedImages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImage ? 'bg-[#F1C27D]' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {processedImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {processedImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                index === currentImage
                  ? 'border-[#F1C27D] ring-2 ring-[#F1C27D]/30'
                  : 'border-[#334155] hover:border-[#F1C27D]/50'
              }`}
            >
              <img
                src={image}
                alt={`${productTitle} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src='/placeholder-image.png'; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
'''

# Replace lines 58-189 (indexes 57-188 in 0-based)
new_lines = lines[:57] + [new_component + '\n'] + lines[189:]

# Write back
with open('ProductDetail.jsx', 'w') as f:
    f.writelines(new_lines)

print("✅ ImageGallery component replaced with magnifier version!")

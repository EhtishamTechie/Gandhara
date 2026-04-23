#!/bin/bash

# Fix line 435 - Call Us button
sed -i '435s/.*/                <a href="tel:+923005567507" className="flex items-center justify-center py-3 border border-[#334155] text-[#E2E8F0] rounded-lg hover:bg-[#1E293B] transition-all duration-300">/' ProductDetail.jsx

# Fix line 439 - Inquire button (make it open WhatsApp)
sed -i '439s/.*/                <a href={`https:\/\/wa.me\/923005567507?text=${encodeURIComponent(\`Hello, I have an inquiry about: ${product.seoTitle || product.title}\\n\\nProduct Link: ${window.location.href}\`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center py-3 border border-[#334155] text-[#E2E8F0] rounded-lg hover:bg-[#1E293B] transition-all duration-300">/' ProductDetail.jsx

# Change closing tags from button to a
sed -i '438s|</button>|</a>|' ProductDetail.jsx
sed -i '442s|</button>|</a>|' ProductDetail.jsx

echo "✅ Call Us and Inquire buttons fixed!"

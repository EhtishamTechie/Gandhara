#!/bin/bash

# Replace the price section with WhatsApp contact button
awk '
BEGIN { in_price_section = 0 }
/\{\/\* Price \*\/\}/ {
    print "              {/* Contact for Price */}"
    print "              <div className=\"mb-6\">"
    print "                <motion.a"
    print "                  href={`https://wa.me/923005567507?text=${encodeURIComponent(`Hello, I'\''m interested in the price for: ${product.seoTitle || product.title}\\n\\nProduct Link: ${window.location.href}`)}`}"
    print "                  target=\"_blank\""
    print "                  rel=\"noopener noreferrer\""
    print "                  className=\"inline-flex items-center space-x-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300\""
    print "                  whileHover={{ scale: 1.05 }}"
    print "                  whileTap={{ scale: 0.95 }}"
    print "                >"
    print "                  <MessageCircle className=\"w-5 h-5\" />"
    print "                  <span>Contact on WhatsApp for Price</span>"
    print "                </motion.a>"
    print "              </div>"
    in_price_section = 1
    next
}
in_price_section && /^              <\/div>$/ && !seen_closing {
    seen_closing = 1
    in_price_section = 0
    next
}
!in_price_section { print }
' ProductDetail.jsx > ProductDetail.jsx.tmp

mv ProductDetail.jsx.tmp ProductDetail.jsx

echo "✅ Price section replaced with WhatsApp contact button!"

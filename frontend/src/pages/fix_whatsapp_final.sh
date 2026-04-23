#!/bin/bash

# Create a proper fix using awk to replace lines 180-185
awk 'NR==180 {print "const WhatsAppButton = ({ phoneNumber = \"+92 300 5567507\", productName, productId, productUrl, className, children, ...props }) => {"; next}
     NR==181 {print "  const productLink = productUrl || `${window.location.origin}/product/${productId}`;"; next}
     NR==182 {print "  const message = `Hello, I'\''m interested in your product: ${productName}\\n\\nProduct Link: ${productLink}`;"; next}
     NR==183 {print "  const encodedMessage = encodeURIComponent(message);"; next}
     NR==184 {print "  const cleanPhoneNumber = phoneNumber.replace(/\\s+/g, \"\").replace(\"+\", \"\");"; next}
     NR==185 {print "  const whatsappLink = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`;"; next}
     {print}' ProductPage.jsx > ProductPage.jsx.tmp

mv ProductPage.jsx.tmp ProductPage.jsx

# Now add productUrl to the WhatsAppButton calls
sed -i '384a\                productUrl={`${window.location.origin}/product/${product.slug || product._id}`}' ProductPage.jsx
sed -i '481a\          productUrl={`${window.location.origin}/product/${product.slug || product._id}`}' ProductPage.jsx

echo "✅ WhatsAppButton fixed properly!"

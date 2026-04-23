#!/bin/bash

# Fix the WhatsAppButton component
sed -i '180s/.*/const WhatsAppButton = ({ phoneNumber = "+92 300 5567507", productName, productId, productUrl, className, children, ...props }) => {/' ProductPage.jsx

sed -i '181s/.*/  const productLink = productUrl || `${window.location.origin}\/product\/${productId}`;/' ProductPage.jsx

sed -i '182s/.*/  const message = `Hello, I'\''m interested in your product: ${productName}\\n\\nProduct Link: ${productLink}`;/' ProductPage.jsx

echo "✅ WhatsAppButton component updated!"

# Now add productUrl to the two places where WhatsAppButton is used
echo "Now updating WhatsAppButton usage..."

# Find and update line 411 (inside modal)
sed -i '411,415s/productId={product._id}/productId={product._id}\n                productUrl={`${window.location.origin}\/product\/${product.slug || product._id}`}/' ProductPage.jsx

# Find and update line 507 (inside ProductCard)
sed -i '507,511s/productId={product._id}/productId={product._id}\n          productUrl={`${window.location.origin}\/product\/${product.slug || product._id}`}/' ProductPage.jsx

echo "✅ All WhatsAppButton calls updated with productUrl!"

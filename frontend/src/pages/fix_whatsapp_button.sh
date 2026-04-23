#!/bin/bash

# Use sed to update the WhatsAppButton component
sed -i '180,184s/.*/const WhatsAppButton = ({ phoneNumber = "+92 300 5567507", productName, productId, productUrl, className, children, ...props }) => {\n  const productLink = productUrl || `${window.location.origin}\/product\/${productId}`;\n  const message = `Hello, I'\''m interested in your product: ${productName}\n\nProduct Link: ${productLink}`;\n  const encodedMessage = encodeURIComponent(message);\n  const cleanPhoneNumber = phoneNumber.replace(\/\\s+\/g, "").replace("+", "");/' ProductPage.jsx

echo "✅ WhatsAppButton fixed to include product URL"

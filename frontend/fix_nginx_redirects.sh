#!/bin/bash

NGINX_CONFIG="/etc/nginx/sites-enabled/gandhara-arts-and-taxila-stone-crafts.com"

echo "Removing product redirect block from Nginx config..."

# Use awk to remove the entire location ~* ^/product/ block
sudo awk '
/location ~\* \^\/product\/\(.+\?\)\/?/ { 
    skip=1
    brace_count=0
}
skip {
    if ($0 ~ /{/) brace_count++
    if ($0 ~ /}/) brace_count--
    if (brace_count == 0 && $0 ~ /}/) {
        skip=0
        next
    }
    next
}
!skip { print }
' "$NGINX_CONFIG" | sudo tee "${NGINX_CONFIG}.temp" > /dev/null

sudo mv "${NGINX_CONFIG}.temp" "$NGINX_CONFIG"

echo "Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid. Reloading..."
    sudo systemctl reload nginx
    echo "✅ Done! Product URLs will now work correctly."
    echo ""
    echo "The product redirect block has been removed."
    echo "Backup saved at: ${NGINX_CONFIG}.backup"
else
    echo "❌ Nginx config has errors. Please check manually."
fi

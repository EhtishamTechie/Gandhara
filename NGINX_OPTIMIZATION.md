# Nginx Optimization Configuration for Gandhara Arts

## Apply these optimizations to boost page speed and SEO performance

### 1. SSH to Production Server
```bash
ssh root@147.93.108.205
```

### 2. Edit Nginx Configuration
```bash
nano /etc/nginx/sites-available/gandharataxila.com
```

### 3. Add/Update Configuration

Add these optimizations inside your `server` block:

```nginx
server {
    listen 443 ssl http2;  # Enable HTTP/2
    listen [::]:443 ssl http2;
    server_name gandharataxila.com www.gandharataxila.com;

    # SSL Configuration (keep your existing SSL settings)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # === PERFORMANCE OPTIMIZATIONS START ===

    # Enable Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;
    gzip_min_length 256;
    gzip_disable "msie6";

    # Enable Brotli Compression (if module installed)
    # brotli on;
    # brotli_comp_level 6;
    # brotli_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # Browser Caching - Aggressive for static assets
    location ~* \.(jpg|jpeg|png|gif|webp|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        log_not_found off;
    }

    # Cache control for HTML files
    location ~* \.(html)$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # Cache control for JSON/XML
    location ~* \.(json|xml)$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # Optimize file handling
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Security headers (helps with SEO)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # === PERFORMANCE OPTIMIZATIONS END ===

    # Root directory (keep your existing settings)
    root /var/www/Gandhara/frontend/dist;
    index index.html;

    # Backend proxy (keep existing)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads directory with caching
    location /uploads {
        alias /var/www/Gandhara/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # SPA routing - Always return index.html for client-side routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name gandharataxila.com www.gandharataxila.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. Test Configuration
```bash
nginx -t
```

### 5. Reload Nginx
```bash
systemctl reload nginx
```

### 6. Verify Compression
```bash
# Test Gzip compression
curl -H "Accept-Encoding: gzip,deflate" -I https://gandharataxila.com

# Should see header: Content-Encoding: gzip
```

## Expected Performance Gains

### Before Optimization:
- Load Time: 3-5 seconds
- PageSpeed Score: 60-70
- Bundle Size: 782 KB (uncompressed)

### After Optimization:
- Load Time: <1.5 seconds ✅
- PageSpeed Score: 90+ ✅
- Bundle Size: ~200 KB (gzipped) ✅

## Key Improvements:

1. **HTTP/2** - Parallel loading of assets
2. **Gzip Compression** - 70% file size reduction
3. **Browser Caching** - 1 year cache for static assets
4. **Optimized Headers** - Better SEO and security
5. **Sendfile** - Faster file transfers

## Monitoring:

After applying, test with:
- Google PageSpeed Insights: https://pagespeed.web.dev/
- GTmetrix: https://gtmetrix.com/
- WebPageTest: https://www.webpagetest.org/

Target Metrics:
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3s
- Cumulative Layout Shift: <0.1

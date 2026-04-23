const fs = require('fs');

// Read the script
const scriptPath = '/var/www/Gandhara/backend/scripts/optimizeProductionImages.js';
let content = fs.readFileSync(scriptPath, 'utf8');

// Replace the paths
content = content.replace(
  /UPLOADS_DIR: path\.join\(__dirname, '\.\.\/\.\.\/uploads'\)|UPLOADS_DIR: '\/var\/www\/Gandhara\/frontend\/uploads'/g,
  "UPLOADS_DIR: '/var/www/Gandhara/backend/uploads'"
);

content = content.replace(
  /BACKUP_DIR: path\.join\(__dirname, '\.\.\/\.\.\/uploads-backup-original'\)|BACKUP_DIR: '\/var\/www\/Gandhara\/uploads-backup-original'/g,
  "BACKUP_DIR: '/var/www/Gandhara/backend/uploads-backup-original'"
);

// Write back
fs.writeFileSync(scriptPath, content);

console.log('✓ Configuration updated successfully!');
console.log('✓ UPLOADS_DIR: /var/www/Gandhara/backend/uploads');
console.log('✓ BACKUP_DIR: /var/www/Gandhara/backend/uploads-backup-original');

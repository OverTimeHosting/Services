const fs = require('fs');
const path = require('path');

const BLUEPRINTS_DIR = path.join(__dirname, '..', 'blueprints');
const PUBLIC_BLUEPRINTS_DIR = path.join(__dirname, '..', 'public', 'blueprints');

// Ensure public/blueprints directory exists
if (!fs.existsSync(PUBLIC_BLUEPRINTS_DIR)) {
  fs.mkdirSync(PUBLIC_BLUEPRINTS_DIR, { recursive: true });
}

// Copy directory recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✓ Copied ${entry.name}`);
    }
  }
}

// Get all blueprint directories
const blueprints = fs.readdirSync(BLUEPRINTS_DIR, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

console.log(`\n🚀 Syncing ${blueprints.length} blueprints...\n`);

// Copy each blueprint
for (const blueprint of blueprints) {
  const srcDir = path.join(BLUEPRINTS_DIR, blueprint);
  const destDir = path.join(PUBLIC_BLUEPRINTS_DIR, blueprint);

  console.log(`📦 Syncing ${blueprint}/`);
  copyDirectory(srcDir, destDir);
}

console.log(`\n✅ Successfully synced all blueprints!\n`);

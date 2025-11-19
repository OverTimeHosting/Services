const fs = require('fs');
const path = require('path');
const https = require('https');

const BLUEPRINTS_DIR = path.join(__dirname, '..', 'blueprints');
const META_FILE = path.join(__dirname, '..', 'meta.json');

// Fetch latest tag from Docker Hub
async function getLatestDockerTag(image) {
  return new Promise((resolve) => {
    // Parse image name (e.g., "postgres:15-alpine" -> "postgres", "15-alpine")
    const [imageName, currentTag] = image.includes(':') ? image.split(':') : [image, 'latest'];
    const [namespace, repo] = imageName.includes('/') ? imageName.split('/') : ['library', imageName];

    // Don't update if it's already using 'latest' or a specific version pattern we want to keep
    if (currentTag === 'latest' || currentTag.match(/^\d+\.\d+\.\d+$/)) {
      console.log(`    ℹ️  Keeping ${image} (already at specific version)`);
      resolve(image);
      return;
    }

    const options = {
      hostname: 'registry.hub.docker.com',
      path: `/v2/repositories/${namespace}/${repo}/tags?page_size=50`,
      method: 'GET',
      headers: {
        'User-Agent': 'Blueprint-Updater/1.0'
      }
    };

    https.get(options, (res) => {
      let data = '';

      res.on('data', (chunk) => data += chunk);

      res.on('end', () => {
        try {
          const json = JSON.parse(data);

          if (!json.results || json.results.length === 0) {
            console.log(`    ⚠️  No tags found for ${imageName}, keeping current`);
            resolve(image);
            return;
          }

          // Try to find a similar tag pattern
          let bestTag = json.results[0].name;

          // If current tag has a pattern like "15-alpine", try to find latest matching that pattern
          if (currentTag.includes('-')) {
            const pattern = currentTag.split('-').slice(1).join('-'); // e.g., "alpine"
            const matchingTag = json.results.find(t =>
              t.name.includes(pattern) && t.name !== currentTag
            );
            if (matchingTag) {
              bestTag = matchingTag.name;
            }
          }

          const newImage = `${imageName}:${bestTag}`;
          if (newImage !== image) {
            console.log(`    ✓ Updated ${image} → ${newImage}`);
          } else {
            console.log(`    = Already latest: ${image}`);
          }
          resolve(newImage);
        } catch (e) {
          console.log(`    ❌ Error parsing tags for ${imageName}:`, e.message);
          resolve(image);
        }
      });
    }).on('error', (e) => {
      console.log(`    ❌ Error fetching ${imageName}:`, e.message);
      resolve(image);
    });
  });
}

// Update docker-compose.yml file
async function updateDockerCompose(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const updatedLines = [];

  let changesMade = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match lines with image: declarations
    const imageMatch = line.match(/^(\s+image:\s+)(.+)$/);

    if (imageMatch) {
      const indent = imageMatch[1];
      const image = imageMatch[2].trim();

      // Skip environment variables
      if (image.startsWith('${')) {
        updatedLines.push(line);
        continue;
      }

      // Get latest version
      const newImage = await getLatestDockerTag(image);

      if (newImage !== image) {
        updatedLines.push(`${indent}${newImage}`);
        changesMade = true;
      } else {
        updatedLines.push(line);
      }
    } else {
      updatedLines.push(line);
    }
  }

  if (changesMade) {
    fs.writeFileSync(filePath, updatedLines.join('\n'));
    return true;
  }

  return false;
}

// Update version in meta.json
function updateMetaVersion(blueprintId, newVersion) {
  const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
  const blueprint = meta.find(b => b.id === blueprintId);

  if (blueprint && blueprint.version !== newVersion) {
    blueprint.version = newVersion;
    fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
    console.log(`    ✓ Updated meta.json version to ${newVersion}`);
  }
}

// Main update function
async function updateAllBlueprints() {
  console.log('\n🚀 Checking for Docker image updates...\n');

  const blueprints = fs.readdirSync(BLUEPRINTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let totalUpdated = 0;

  for (const blueprint of blueprints) {
    const composePath = path.join(BLUEPRINTS_DIR, blueprint, 'docker-compose.yml');

    if (!fs.existsSync(composePath)) {
      continue;
    }

    console.log(`📦 Checking ${blueprint}/`);

    const updated = await updateDockerCompose(composePath);

    if (updated) {
      totalUpdated++;
      console.log(`  ✅ Updated!\n`);
    } else {
      console.log(`  ✓ Already up to date\n`);
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n✅ Update complete! ${totalUpdated} blueprints updated.\n`);
}

// Run the update
updateAllBlueprints().catch(console.error);

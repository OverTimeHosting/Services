const fs = require('fs');
const path = require('path');

const META_FILE = path.join(__dirname, '..', 'meta.json');
const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));

const allTags = {};

meta.forEach(item => {
  if (item.tags) {
    item.tags.forEach(tag => {
      allTags[tag] = (allTags[tag] || 0) + 1;
    });
  }
});

const sorted = Object.entries(allTags).sort((a, b) => b[1] - a[1]);

console.log('\n📊 Tag Usage Statistics:\n');
sorted.forEach(([tag, count]) => {
  console.log(`${count.toString().padStart(3)} - ${tag}`);
});

console.log(`\n📝 Total unique tags: ${sorted.length}\n`);

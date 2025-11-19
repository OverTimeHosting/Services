const fs = require('fs');
const path = require('path');

const META_FILE = path.join(__dirname, '..', 'meta.json');
const PUBLIC_META_FILE = path.join(__dirname, '..', 'public', 'meta.json');

// Tag mapping: similar tags → standardized tag
const TAG_MAPPING = {
  // Case normalization
  'AI': 'ai',
  'LLM': 'llm',
  'API': 'api',
  'E-Commerce': 'e-commerce',
  'Task Tracking': 'task-management',
  'Monitoring': 'monitoring',
  'Data': 'data-management',
  'Notifications': 'notifications',
  'Documents': 'documentation',
  'Document Generation': 'documents',
  'Automation': 'automation',
  'Reporting': 'analytics',
  'Productivity': 'productivity',
  'Image Hosting': 'image-hosting',
  'File Management': 'file-manager',
  'Open Source': 'open-source',
  'Multi-User': 'collaboration',
  'Private Albums': 'privacy',
  'Employee Onboarding': 'hr',
  'HR Management': 'hr',
  'Role-Based Access': 'authentication',
  'Document Management': 'documents',
  'Video': 'video',
  'Audio': 'audio',
  'Real-time': 'real-time',
  'Streaming': 'streaming',
  'Webrtc': 'webrtc',
  'IA': 'ai',

  // Similar concepts
  'selfhosted': 'self-hosted',
  'nocode': 'no-code',
  'no-code': 'low-code',
  'databases': 'database',
  'postgresql': 'postgres',
  'mysql': 'database',
  'mariadb': 'database',
  'sql': 'database',
  'nosql': 'database',

  // Authentication variations
  'oauth': 'oauth2',
  'oidc': 'openid-connect',
  'saml': 'sso',
  '2fa': 'authentication',
  'totp': 'authentication',
  'auth': 'authentication',
  'authorization': 'authentication',
  'identity': 'authentication',
  'iam': 'authentication',
  'identity-management': 'authentication',
  'access-management': 'authentication',

  // Media variations
  'media system': 'media',
  'media-server': 'media',
  'music': 'audio',
  'audiobooks': 'audio',
  'podcasts': 'audio',
  'video': 'media',
  'videos': 'media',
  'movies': 'media',
  'photo': 'photos',
  'gallery': 'photos',

  // Development tools
  'developer-tools': 'development',
  'developer': 'development',
  'ide': 'development',
  'ci-cd': 'devops',
  'version-control': 'git',
  'scm': 'git',
  'github': 'git',
  'gitea': 'git',

  // CMS variations
  'content-management': 'cms',
  'content': 'cms',
  'wordpress': 'cms',
  'blog': 'cms',
  'publishing': 'cms',
  'website': 'cms',

  // Finance variations
  'budgeting': 'finance',
  'bookkeeping': 'finance',
  'accounting': 'finance',
  'money': 'finance',
  'personal-finance': 'finance',
  'business-finance': 'finance',
  'money-management': 'finance',
  'expense-tracking': 'finance',
  'spending': 'finance',
  'budget': 'finance',
  'invoice': 'invoicing',
  'billing': 'invoicing',
  'payment': 'invoicing',

  // Storage variations
  'file-storage': 'storage',
  'file-sharing': 'storage',
  'file': 'storage',
  'object-storage': 's3',
  'cloud': 'storage',

  // Communication
  'messaging': 'chat',
  'communication': 'chat',
  'whatsapp': 'chat',
  'matrix': 'chat',

  // Monitoring variations
  'observability': 'monitoring',
  'metrics': 'monitoring',
  'alerting': 'monitoring',
  'alerts': 'monitoring',
  'uptime': 'monitoring',
  'statistics': 'analytics',
  'bi': 'analytics',
  'data-analysis': 'analytics',

  // Management variations
  'manager': 'management',
  'task-management': 'productivity',
  'project-management': 'productivity',
  'knowledge-management': 'knowledge-base',
  'data-management': 'database',
  'client-management': 'crm',

  // Networking
  'networking': 'network',
  'proxy': 'network',
  'reverse-proxy': 'network',
  'vpn': 'network',
  'tunnel': 'network',
  'dns': 'network',
  'firewall': 'security',

  // Utilities
  'utility': 'tools',
  'utilities': 'tools',
  'simple': 'tools',

  // Backend/Frontend
  'backend': 'api',
  'frontend': 'ui',

  // Other consolidations
  'e-mail': 'email',
  'mail-server': 'email',
  'webmail': 'email',
  'smtp': 'email',
  'imap': 'email',
  'pop3': 'email',

  'news': 'rss',
  'news-aggregator': 'rss',
  'aggregator': 'rss',
  'feed-reader': 'rss',
  'feeds': 'rss',

  'bookmark-manager': 'bookmarks',
  'link-sharing': 'sharing',
  'text-sharing': 'sharing',

  'spreadsheet': 'productivity',
  'notepad': 'notes',
  'markdown': 'notes',
  'text-editor': 'notes',
  'document-editor': 'documents',

  'torrents': 'torrent',
  'download': 'downloader',

  'homelab': 'self-hosted',
  'selfhost': 'self-hosted',

  'server': 'hosting',
  'hosting': 'self-hosted',
};

// Tags to remove completely (too generic or redundant)
const TAGS_TO_REMOVE = new Set([
  'web',
  'web-based',
  'open-source', // Most are self-hosted anyway
  'applications',
  'console',
  'webui',
  'lightweight',
  'simple',
  'collection',
  'personal',
  'personal-use',
  'multi-tenant',
]);

function simplifyTags(tags) {
  if (!tags || !Array.isArray(tags)) return [];

  // Apply mapping and normalize
  let simplified = tags.map(tag => {
    const lower = tag.toLowerCase().trim();
    return TAG_MAPPING[tag] || TAG_MAPPING[lower] || lower;
  });

  // Remove tags in removal list
  simplified = simplified.filter(tag => !TAGS_TO_REMOVE.has(tag));

  // Remove duplicates
  simplified = [...new Set(simplified)];

  // Sort alphabetically
  simplified.sort();

  return simplified;
}

function updateMetaFile(filePath) {
  const meta = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let totalChanged = 0;
  let tagsBefore = 0;
  let tagsAfter = 0;

  meta.forEach(item => {
    if (item.tags) {
      const before = item.tags.length;
      const simplified = simplifyTags(item.tags);

      if (JSON.stringify(item.tags) !== JSON.stringify(simplified)) {
        tagsBefore += before;
        tagsAfter += simplified.length;
        item.tags = simplified;
        totalChanged++;
      }
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(meta, null, 2));

  return { totalChanged, tagsBefore, tagsAfter };
}

console.log('\n🏷️  Simplifying tags...\n');

// Update main meta.json
console.log('📝 Updating meta.json...');
const result1 = updateMetaFile(META_FILE);
console.log(`  ✓ Updated ${result1.totalChanged} blueprints`);
console.log(`  ✓ Tags: ${result1.tagsBefore} → ${result1.tagsAfter}\n`);

// Update public meta.json
console.log('📝 Updating public/meta.json...');
const result2 = updateMetaFile(PUBLIC_META_FILE);
console.log(`  ✓ Updated ${result2.totalChanged} blueprints`);
console.log(`  ✓ Tags: ${result2.tagsBefore} → ${result2.tagsAfter}\n`);

// Show new unique tag count
const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
const uniqueTags = new Set();
meta.forEach(item => {
  if (item.tags) {
    item.tags.forEach(tag => uniqueTags.add(tag));
  }
});

console.log(`✅ Done! Reduced from 463 to ${uniqueTags.size} unique tags\n`);

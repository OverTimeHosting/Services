# Blueprint Management Scripts

## 🔄 Auto-Update Docker Images

Automatically updates Docker images in all blueprint docker-compose files to their latest versions.

### Usage

```bash
# Update all Docker images
npm run update

# Update images and sync to public/
npm run update:sync
```

### How It Works

1. Scans all `blueprints/*/docker-compose.yml` files
2. Queries Docker Hub API for latest image versions
3. Updates image tags intelligently:
   - Keeps version patterns (e.g., `postgres:15-alpine` → `postgres:16-alpine`)
   - Skips environment variables (`${DOCKER_IMAGE}`)
   - Preserves specific version tags
4. Writes updated docker-compose.yml files

### Automatic Updates

GitHub Actions runs this automatically:
- **Every Monday at 3 AM UTC**
- **Manual trigger** via GitHub Actions tab

The workflow will:
1. Update all Docker images
2. Sync to public/ folder
3. Commit and push changes if updates found
4. Trigger deployment via webhook

## 📦 Sync Blueprints

Copies all blueprints from `blueprints/` to `public/blueprints/`.

### Usage

```bash
# Sync blueprints manually
npm run sync
```

### Automatic Sync

- Runs automatically before every build (`npm run build`)
- Ensures public/ is always up to date

## Example Output

```
🚀 Checking for Docker image updates...

📦 Checking postgres/
    ✓ Updated postgres:15-alpine → postgres:16-alpine
  ✅ Updated!

📦 Checking nextjs/
    = Already latest: node:20-alpine
  ✓ Already up to date

✅ Update complete! 12 blueprints updated.
```

## Adding New Blueprints

1. Create folder in `blueprints/my-app/`
2. Add `docker-compose.yml`, `template.toml`, and logo
3. Run `npm run sync` to copy to public/
4. Update `meta.json` with blueprint metadata

The update script will automatically check for newer Docker images!

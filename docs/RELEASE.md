# Release Process

## Steps to Release a New Version

### 1. Build the Plugin

```bash
bun run build
```

This runs tests, linting, and builds `main.js`.

### 2. Bump the Version

Run one of the following commands based on the type of change:

```bash
bun run version:patch   # Bug fixes (0.3.0 → 0.3.1)
bun run version:minor   # New features (0.3.0 → 0.4.0)
bun run version:major   # Breaking changes (0.3.0 → 1.0.0)
```

This automatically:
- Updates `package.json`, `manifest.json`, and `versions.json`
- Creates a git commit
- Creates a git tag

### 3. Push to GitHub

```bash
git push origin main --tags
```

### 4. Create GitHub Release

1. Go to [Releases](../../releases) → "Draft a new release"
2. Select the new tag (e.g., `0.4.0`)
3. Set title to `v0.4.0`
4. Copy content from `.github/RELEASE_TEMPLATE.md` and fill in:
   - Version number
   - New features, bug fixes, improvements
   - Minimum Obsidian version (from `manifest.json`)
5. Upload release assets:
   - `main.js`
   - `manifest.json`
   - `styles.css`
6. Publish the release

### Alternative: Using GitHub CLI

```bash
gh release create 0.4.0 main.js manifest.json styles.css \
  --title "v0.4.0" \
  --notes "## What's New
- Feature X
- Bug fix Y"
```

## Version History

See [GitHub Releases](../../releases) for the complete changelog.

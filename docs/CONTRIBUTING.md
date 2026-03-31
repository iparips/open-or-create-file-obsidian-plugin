## Development

This project uses [Bun](https://bun.sh/) for TypeScript development, which simplifies the setup process compared to traditional Node.js + TypeScript configurations.

### Setup

1. Install Bun
2. Clone this repository
3. Run `bun install` to install dependencies
4. Run `bun run build` to build the plugin
5. Create a symlink to the Obsidian plugins directory

IMPORTANT: The symlink name must match the manifest ID (`open-or-create-file-command`), not the repository name.

If you have the plugin installed from the Community Plugins store, remove it first:

```bash
rm -rf /path/to/vault/.obsidian/plugins/open-or-create-file-command
```

Then create the symlink with the correct name:

```bash
ln -sfh /Users/ilya/Code/open-or-create-file-obsidian-plugin /path/to/vault/.obsidian/plugins/open-or-create-file-command
```

Flags:
- `-s` creates a symbolic link
- `-f` overwrites the destination if it already exists
- `-h` prevents following an existing symlink at the destination (avoids creating a nested symlink inside the linked directory)

Example:

```bash
ln -sfh /Users/ilya/Code/open-or-create-file-obsidian-plugin /Users/ilya/ObsidianVault23/Personal/.obsidian/plugins/open-or-create-file-command
```

Why this matters: The symlink name must match the `id` field in manifest.json. This ensures that:

- Plugin settings are saved/loaded from the correct location
- Obsidian Sync syncs settings to the correct directory
- The plugin functions correctly in development

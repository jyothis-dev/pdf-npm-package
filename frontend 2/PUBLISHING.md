# Publishing Guide

## ✅ What's Been Fixed

Your package is now ready for npm publishing! Here's what was fixed:

1. **TypeScript Declaration Files**: Fixed import paths to generate `.d.ts` files for TypeScript support
2. **Dependencies**: Moved `express`, `multer`, and `cors` to `devDependencies` (they're only needed for the server, not the package itself)
3. **Build Configuration**: Package now builds successfully with both ESM and CommonJS formats
4. **`.npmignore`**: Created to exclude unnecessary files from the published package

## 📦 Package Status

✅ Build generates all required files:
- `dist/index.js` (ESM)
- `dist/index.cjs` (CommonJS)
- `dist/index.d.ts` (TypeScript declarations)
- `dist/index.d.cts` (CommonJS TypeScript declarations)

✅ Package size: ~7KB (unpacked: ~39KB)

## ⚠️ Before Publishing

### 1. Update Package Name (REQUIRED)

The current package name `@your-scope/pdf-template-engine` is a placeholder. You need to change it to one of:

**Option A: Scoped Package (Recommended)**
- If you have an npm organization: `@your-org/pdf-template-engine`
- Example: `@jyothiswarup/pdf-template-engine`

**Option B: Unscoped Package**
- Simple name: `pdf-template-engine` (check availability first)
- Example: `pdf-coordinate-filler` or `pdf-template-filler`

**To change the name:**
```bash
cd "frontend 2"
# Edit package.json and change the "name" field
# Then run:
npm install  # This updates package-lock.json
```

### 2. Optional: Add Repository URL

Add this to `package.json` if you have a GitHub repo:
```json
"repository": {
  "type": "git",
  "url": "https://github.com/yourusername/pdf-npm-package.git"
}
```

## 🚀 How to Publish

### First Time Publishing

1. **Login to npm** (if not already):
   ```bash
   npm login
   ```

2. **Verify you're logged in**:
   ```bash
   npm whoami
   ```

3. **Build the package**:
   ```bash
   cd "frontend 2"
   npm run build
   ```

4. **Test the package locally** (optional but recommended):
   ```bash
   npm pack --dry-run  # See what will be published
   npm pack            # Create tarball
   # Test installing it in another project
   ```

5. **Publish**:
   ```bash
   npm publish
   # For scoped packages (if not public):
   npm publish --access public
   ```

### Updating the Package

When you make changes and want to publish an update:

1. **Make your changes** to the code

2. **Update version** in `package.json`:
   - Patch: `1.0.0` → `1.0.1` (bug fixes)
   - Minor: `1.0.0` → `1.1.0` (new features, backward compatible)
   - Major: `1.0.0` → `2.0.0` (breaking changes)

   Or use npm version:
   ```bash
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```

3. **Rebuild**:
   ```bash
   npm run build
   ```

4. **Publish**:
   ```bash
   npm publish
   ```

## 📝 Publishing Workflow

```
Make Changes → Update Version → Build → Test → Publish → Update README (if needed)
```

## 🔍 Verify After Publishing

1. Check npm registry: `https://www.npmjs.com/package/your-package-name`
2. Test installation:
   ```bash
   npm install your-package-name
   ```
3. Test in a new project to ensure it works

## 📋 Checklist Before Publishing

- [ ] Package name updated (not `@your-scope/...`)
- [ ] Version number set appropriately
- [ ] `npm run build` succeeds
- [ ] `npm pack --dry-run` shows correct files
- [ ] README.md is complete and accurate
- [ ] All tests pass (if you have tests)
- [ ] You're logged into npm (`npm whoami`)

## 🎯 Recommended Package Names

Some suggestions (check availability first):
- `pdf-template-engine`
- `pdf-coordinate-filler`
- `pdf-field-filler`
- `pdf-template-filler`
- `@yourusername/pdf-template-engine` (scoped)

## 💡 Tips

1. **Start with version 1.0.0** for your first publish
2. **Use semantic versioning** (semver) for updates
3. **Keep README.md updated** with examples and API docs
4. **Consider adding a CHANGELOG.md** to track changes
5. **Test locally** before publishing to avoid mistakes



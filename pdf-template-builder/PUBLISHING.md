# Publishing Guide for @jyothiswarup/pdf-template-builder

## ✅ Package Status

Your package is ready for npm publishing! Here's what's already configured:

1. **Package Name**: `@jyothiswarup/pdf-template-builder` (scoped package)
2. **Build Configuration**: tsup configured for ESM and CommonJS formats
3. **TypeScript Support**: Type declarations generated automatically
4. **Publish Config**: Set to `"access": "public"` for scoped packages
5. **Files Configuration**: Only `dist` and `README.md` will be published
6. **`.npmignore`**: Configured to exclude source files and dev dependencies

## 📦 What Gets Published

The following files will be included in the npm package:
- `dist/` - All built files (JS, MJS, TypeScript declarations, CSS)
- `README.md` - Package documentation
- `package.json` - Package metadata

## ⚠️ Pre-Publishing Checklist

Before publishing, make sure:

- [ ] **Build succeeds**: Run `npm run build` and verify no errors
- [ ] **Version number**: Check `package.json` version is appropriate (currently `0.1.0`)
- [ ] **README.md**: Complete and accurate documentation
- [ ] **Test locally**: Use `npm pack` to test the package locally
- [ ] **npm login**: You're logged into npm (`npm whoami`)
- [ ] **Scoped package access**: Since it's a scoped package, ensure `publishConfig.access` is set to `"public"` (already done ✅)

## 🚀 How to Publish

### First Time Publishing

1. **Navigate to the package directory**:
   ```bash
   cd pdf-template-builder
   ```

2. **Login to npm** (if not already logged in):
   ```bash
   npm login
   ```
   Enter your npm credentials when prompted.

3. **Verify you're logged in**:
   ```bash
   npm whoami
   ```
   Should display your npm username.

4. **Build the package**:
   ```bash
   npm run build
   ```
   This creates the `dist/` folder with all compiled files.

5. **Verify the build output**:
   ```bash
   ls -la dist/
   ```
   You should see:
   - `index.js` (CommonJS)
   - `index.mjs` (ESM)
   - `index.d.ts` (TypeScript declarations)
   - `styles.css` (CSS file)
   - Source maps and other declaration files

6. **Test the package locally** (highly recommended):
   ```bash
   # See what will be published (dry run)
   npm pack --dry-run
   
   # Create a tarball for local testing
   npm pack
   ```
   This creates a `.tgz` file. You can test it in another project:
   ```bash
   # In another project
   npm install /path/to/pdf-template-builder-0.1.0.tgz
   ```

7. **Publish to npm**:
   ```bash
   npm publish --access public
   ```
   Note: The `--access public` flag is required for scoped packages to make them publicly accessible.

### Updating the Package

When you make changes and want to publish an update:

1. **Make your changes** to the source code in `src/`

2. **Update the version** in `package.json`:
   - **Patch**: `0.1.0` → `0.1.1` (bug fixes)
   - **Minor**: `0.1.0` → `0.2.0` (new features, backward compatible)
   - **Major**: `0.1.0` → `1.0.0` (breaking changes)

   Or use npm version command (recommended):
   ```bash
   npm version patch  # 0.1.0 → 0.1.1
   npm version minor  # 0.1.0 → 0.2.0
   npm version major  # 0.1.0 → 1.0.0
   ```
   This automatically updates `package.json` and creates a git tag.

3. **Rebuild the package**:
   ```bash
   npm run build
   ```

4. **Publish**:
   ```bash
   npm publish --access public
   ```

## 📝 Publishing Workflow

```
Make Changes → Update Version → Build → Test Locally → Publish → Verify
```

## 🔍 Verify After Publishing

1. **Check npm registry**:
   Visit: `https://www.npmjs.com/package/@jyothiswarup/pdf-template-builder`

2. **Test installation** in a new project:
   ```bash
   npm install @jyothiswarup/pdf-template-builder
   ```

3. **Test the package**:
   ```tsx
   import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
   import '@jyothiswarup/pdf-template-builder/styles';
   
   // Use the component
   ```

## 🐛 Troubleshooting

### Error: "You must verify your email before publishing packages"
- **Solution**: Check your email and verify it on npmjs.com

### Error: "Package name already exists"
- **Solution**: The package name is already taken. Since you're using a scoped package, this shouldn't happen, but if it does, you may need to use a different scope or name.

### Error: "You do not have permission to publish"
- **Solution**: Make sure you're logged in with the correct npm account that owns the `@jyothiswarup` scope.

### Build fails
- **Solution**: 
  ```bash
  # Clean and rebuild
  rm -rf dist node_modules
  npm install
  npm run build
  ```

### TypeScript errors
- **Solution**: Run type checking:
  ```bash
  npm run typecheck
  ```
  Fix any TypeScript errors before building.

## 📋 Version Management Best Practices

1. **Start with 0.1.0** for initial release (you're already there ✅)
2. **Use semantic versioning** (semver):
   - `MAJOR.MINOR.PATCH` (e.g., `1.2.3`)
   - Major: Breaking changes
   - Minor: New features (backward compatible)
   - Patch: Bug fixes
3. **Consider adding a CHANGELOG.md** to track changes between versions

## 💡 Tips

1. **Always test locally** with `npm pack` before publishing
2. **Keep README.md updated** with examples and API documentation
3. **Use `npm version` command** instead of manually editing version in package.json
4. **Tag releases in git** after publishing (npm version does this automatically)
5. **Consider using GitHub Actions** for automated publishing on version bumps

## 🔗 Related Packages

- [`@jyothiswarup/pdf-template-engine`](https://www.npmjs.com/package/@jyothiswarup/pdf-template-engine) - Backend package for PDF generation

## 📚 Additional Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [Scoped Packages](https://docs.npmjs.com/cli/v9/using-npm/scope)


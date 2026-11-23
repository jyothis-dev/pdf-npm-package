# Fix for Export Error

## Issue
```
The requested module does not provide an export named 'PDFTemplateBuilder'
```

## Solution Applied

Updated `package.json` in `pdf-template-builder` to correctly point to ESM build:

```json
"exports": {
  ".": {
    "types": "./dist/index.d.ts",
    "import": "./dist/index.mjs",  // Changed from index.js
    "require": "./dist/index.js"
  }
}
```

## Next Steps

1. **Restart Vite dev server** (if running):
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

2. **Clear Vite cache** (if still having issues):
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Rebuild the package** (if needed):
   ```bash
   cd ../pdf-template-builder
   npm run build
   ```

The package should now work correctly!


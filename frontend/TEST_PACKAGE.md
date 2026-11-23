# Testing pdf-template-builder Package

## Setup Complete ✅

The package has been linked and is ready to test!

## How to Test

### Option 1: Use the Test Component (Recommended)

1. **Update main.tsx** to use the test component:
   ```tsx
   // In src/main.tsx, change:
   import App from './App';
   // To:
   import App from './AppTest';
   ```

2. **Start the dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the package**:
   - Upload a PDF
   - Add fields
   - Export schema
   - Generate PDF

### Option 2: Use in Your Existing App

Import the package components in your existing `App.tsx`:

```tsx
import { PDFTemplateBuilder } from '@jyothiswarup/pdf-template-builder';
import '@jyothiswarup/pdf-template-builder/styles';

// Use it in your component
<PDFTemplateBuilder
  apiEndpoint="http://localhost:3000/pdf"
  onSchemaExport={(schema) => console.log(schema)}
/>
```

## Package Features Being Tested

- ✅ PDF upload and rendering
- ✅ Field mapping (add, edit, delete)
- ✅ Schema export
- ✅ PDF generation via API
- ✅ Styling and layout
- ✅ Multi-page support

## Troubleshooting

### If package not found:
```bash
cd pdf-template-builder
npm run build
npm link

cd ../frontend
npm link @jyothiswarup/pdf-template-builder
```

### If styles not loading:
Make sure you import:
```tsx
import '@jyothiswarup/pdf-template-builder/styles';
```

### If build errors:
1. Rebuild the package: `cd pdf-template-builder && npm run build`
2. Restart the frontend dev server

## Next Steps

After testing:
1. Fix any issues found
2. Update package version
3. Build and publish: `npm publish --access public`


# Testing Guide - AppTest.tsx

## ✅ Setup Status

Your `AppTest.tsx` is already configured and ready to run!

- ✅ Package is linked: `@jyothiswarup/pdf-template-builder`
- ✅ `main.tsx` is set to use `AppTest.tsx`
- ✅ Styles are imported
- ✅ API endpoint is configured: `http://localhost:3000/pdf`

## How to Run

### 1. Start the Backend Server (Required)

In a terminal, start your backend server:

```bash
cd backend-test
npm start
```

The server should start on `http://localhost:3000`

### 2. Start the Frontend Dev Server

In another terminal:

```bash
cd frontend
npm run dev
```

The frontend will open at `http://localhost:5173` (or next available port)

## What to Test

### ✅ Basic Functionality

1. **Upload PDF**
   - Click "Upload PDF" button
   - Select a PDF file
   - PDF should render with light blue background

2. **Add Fields**
   - Click anywhere on the PDF to add a field
   - Field should appear as a blue dashed box
   - You can drag and resize fields

3. **Edit Fields**
   - Click on a field to select it
   - Edit the field name/key
   - Adjust font size
   - Add sample data

4. **Export Schema**
   - Click "📥 Export JSON Schema"
   - Schema should download as JSON file
   - Check console for schema data

5. **Generate PDF**
   - Fill in sample data for fields
   - Click "🚀 Generate PDF"
   - PDF should be generated and downloaded
   - Check that fields are filled correctly

### ✅ Package Integration

- Components should render correctly
- Styles should be applied (light blue background)
- No console errors
- All interactions work smoothly

## Troubleshooting

### If package not found:
```bash
cd pdf-template-builder
npm run build
npm link

cd ../frontend
npm link @jyothiswarup/pdf-template-builder
```

### If backend not responding:
- Make sure backend server is running on port 3000
- Check `backend-test/server.js` is running
- Verify API endpoint: `http://localhost:3000/pdf`

### If styles not loading:
- Make sure you have: `import '@jyothiswarup/pdf-template-builder/styles';`
- Check browser console for CSS errors

### If fields not showing:
- Check browser console for errors
- Verify PDF uploaded successfully
- Check that pages array is populated

## Expected Behavior

✅ **Working correctly if:**
- PDF uploads and displays
- Fields can be added by clicking
- Fields can be dragged and resized
- Schema exports correctly
- PDF generates with filled fields

❌ **Issues to watch for:**
- Import errors
- Component not rendering
- API errors (check backend is running)
- Field mapping errors

## Next Steps After Testing

1. If everything works → Package is ready to publish!
2. If issues found → Fix and rebuild package
3. Test with different PDFs and field configurations


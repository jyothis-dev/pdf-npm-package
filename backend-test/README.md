# Backend Test Server

Express server that uses the `@jyothiswarup/pdf-template-engine` npm package to generate PDFs from frontend requests.

## Setup

```bash
npm install
```

## Start Server

```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### Generate PDF
```
POST /pdf
```

**Request Format** (multipart/form-data):
- `pdf`: PDF file (the template)
- `schema`: JSON string of field definitions
- `data`: JSON string of field values

**Response**:
- PDF file (binary)

**Example Schema**:
```json
[
  {
    "key": "customerName",
    "x": 100,
    "y": 700,
    "fontSize": 14,
    "page": 1
  }
]
```

**Example Data**:
```json
{
  "customerName": "John Doe"
}
```

## Frontend Integration

This server is designed to work with the React frontend in the `../frontend` directory.

The frontend sends:
1. PDF template file
2. Field schema (coordinates, font sizes, etc.)
3. Field data (values to fill)

The server:
1. Receives the data
2. Uses `@jyothiswarup/pdf-template-engine` to generate the PDF
3. Returns the generated PDF file

## Testing

Run the standalone test:
```bash
npm test
```

This will create a test PDF using the package directly.



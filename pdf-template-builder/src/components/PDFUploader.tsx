import { useRef, ChangeEvent } from 'react';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

export function PDFUploader({ onFileSelect, loading }: PDFUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      alert('Please select a valid PDF file');
    }
  };

  return (
    <div className="pdf-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={loading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="upload-button"
      >
        {loading ? 'Loading PDF...' : 'Upload PDF'}
      </button>
    </div>
  );
}

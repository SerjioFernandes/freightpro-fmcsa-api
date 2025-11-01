import { useState } from 'react';
import { documentService } from '../../services/document.service';
import { useUIStore } from '../../store/uiStore';
import { Upload, X, FileText } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ isOpen, onClose, onUploaded }) => {
  const { addNotification } = useUIStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('BOL');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const DOCUMENT_TYPES = ['BOL', 'POD', 'INSURANCE', 'LICENSE', 'CARRIER_AUTHORITY', 'W9', 'OTHER'];

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      addNotification({ 
        type: 'error', 
        message: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.' 
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      addNotification({ 
        type: 'error', 
        message: 'File size exceeds 10MB limit.' 
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      addNotification({ type: 'error', message: 'Please select a file first' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('type', documentType);

      await documentService.uploadDocument(formData);
      
      addNotification({ type: 'success', message: 'Document uploaded successfully!' });
      onUploaded();
      onClose();
      setSelectedFile(null);
      setDocumentType('BOL');
    } catch (error: any) {
      addNotification({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to upload document' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary-blue" />
            Upload Document
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="input w-full"
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select File
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div>
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-600 mt-1">{formatFileSize(selectedFile.size)}</p>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-800 mt-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your file here, or
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-primary-blue hover:text-blue-700 font-medium">
                      browse files
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileInputChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, JPG, or PNG up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn btn-secondary"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="flex-1 btn btn-primary"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                Uploading...
              </span>
            ) : (
              'Upload'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;


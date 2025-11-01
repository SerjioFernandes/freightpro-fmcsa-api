import { useState, useEffect } from 'react';
import { documentService } from '../services/document.service';
import { useUIStore } from '../store/uiStore';
import { FileText, Upload, Trash2, Download, Filter, Grid3x3, List, Plus } from 'lucide-react';
import DocumentUploadModal from '../components/Documents/DocumentUploadModal';

const DOCUMENT_TYPES = [
  'ALL',
  'BOL',
  'POD',
  'INSURANCE',
  'LICENSE',
  'CARRIER_AUTHORITY',
  'W9',
  'OTHER'
];

const Documents = () => {
  const { addNotification } = useUIStore();
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [selectedType]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const params = selectedType !== 'ALL' ? { type: selectedType } : {};
      const response = await documentService.listDocuments(params);
      if (response.success) {
        setDocuments(response.data);
      }
    } catch (error: any) {
      addNotification({ type: 'error', message: 'Failed to load documents' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (document: any) => {
    try {
      const blob = await documentService.downloadDocument(document._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addNotification({ type: 'success', message: 'Download started' });
    } catch (error: any) {
      addNotification({ type: 'error', message: 'Failed to download document' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.deleteDocument(id);
      addNotification({ type: 'success', message: 'Document deleted successfully' });
      loadDocuments();
    } catch (error: any) {
      addNotification({ type: 'error', message: 'Failed to delete document' });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <>
      <DocumentUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)} 
        onUploaded={loadDocuments}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary-blue" />
              Documents
            </h1>
            <p className="text-gray-600 mt-2">Manage your freight documents</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Upload Document
          </button>
        </div>

        {/* Filters and View Toggle */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="input"
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <Grid3x3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Documents Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">No documents uploaded yet</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload First Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div key={doc._id} className="card hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-3">{getFileIcon(doc.mimeType)}</div>
                <h3 className="font-semibold text-gray-900 mb-2 truncate">{doc.originalName}</h3>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p><span className="font-medium">Type:</span> {doc.type}</p>
                  <p><span className="font-medium">Size:</span> {formatFileSize(doc.size)}</p>
                  <p><span className="font-medium">Uploaded:</span> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="btn btn-danger flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{doc.originalName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default Documents;


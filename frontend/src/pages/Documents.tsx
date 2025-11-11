import { useState, useEffect } from 'react';
import { documentService } from '../services/document.service';
import { useUIStore } from '../store/uiStore';
import { FileText, Upload, Trash2, Download, Filter, Grid3x3, List, Plus, Eye } from 'lucide-react';
import DocumentUploadModal from '../components/Documents/DocumentUploadModal';
import type { DocumentRecord } from '../types/document.types';
import { getErrorMessage } from '../utils/errors';

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
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
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
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to load documents') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (doc: DocumentRecord) => {
    try {
      const blob = await documentService.downloadDocument(doc._id);
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = doc.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addNotification({ type: 'success', message: 'Download started' });
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to download document') });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await documentService.deleteDocument(id);
      if (response.success) {
        addNotification({ type: 'success', message: 'Document deleted successfully' });
        void loadDocuments();
      } else {
        addNotification({ type: 'error', message: response.error || 'Failed to delete document' });
      }
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to delete document') });
    }
  };

  const handleView = async (doc: DocumentRecord) => {
    try {
      const blob = await documentService.downloadDocument(doc._id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Clean up after a delay to ensure the new tab can load the file
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to open document') });
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-3 sm:px-4 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  Documents
                </h1>
                <p className="text-sm md:text-base text-gray-600">Manage your freight documents</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden md:inline">Upload Document</span>
                <span className="md:inline lg:hidden">Upload</span>
              </button>
            </div>

            {/* Filters and View Toggle */}
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 hover:border-blue-400 transition-all"
                >
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 md:p-2.5 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                      : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 md:p-2.5 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                      : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  title="List View"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>

        {/* Documents Grid/List */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-2">No documents uploaded yet</p>
            <p className="text-gray-500 text-sm mb-6">Upload your first document to get started</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Upload className="h-5 w-5" />
              Upload First Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div key={doc._id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl mb-3 flex justify-center">{getFileIcon(doc.mimeType)}</div>
                <h3 className="font-semibold text-gray-900 mb-3 truncate text-sm">{doc.originalName}</h3>
                <div className="text-xs text-gray-600 space-y-1.5 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Type:</span>
                    <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">{doc.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-medium">{formatFileSize(doc.size)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Uploaded:</span>
                    <span className="font-medium">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleView(doc)}
                    className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-2.5 rounded-lg font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    title="View Document"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg font-semibold text-xs shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    title="Download Document"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center sm:w-auto w-full"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Icon</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Document Name</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Size</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                        <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
                      </td>
                      <td className="px-4 md:px-6 py-3">
                        <div className="text-sm font-semibold text-gray-900 truncate max-w-xs">{doc.originalName}</div>
                      </td>
                      <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">{doc.type}</span>
                      </td>
                      <td className="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600 font-medium">
                        {formatFileSize(doc.size)}
                      </td>
                      <td className="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleView(doc)}
                            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc._id)}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-3 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            title="Delete"
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
      </div>
    </>
  );
};

export default Documents;


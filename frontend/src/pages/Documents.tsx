import { useState, useEffect, useMemo } from 'react';
import { documentService, type DocumentListParams } from '../services/document.service';
import { useUIStore } from '../store/uiStore';
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Filter,
  Grid3x3,
  List,
  Plus,
  Eye,
  Search,
  Calendar,
  RotateCcw,
  CheckSquare,
  Square,
  Tag,
  ShieldCheck,
  Edit,
  X,
  Loader2
} from 'lucide-react';
import DocumentUploadModal from '../components/Documents/DocumentUploadModal';
import type { DocumentRecord, DocumentType, DocumentBulkAction } from '../types/document.types';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');
  const [activeDocument, setActiveDocument] = useState<DocumentRecord | null>(null);
  const [metadataDraft, setMetadataDraft] = useState<{
    type: DocumentType;
    isVerified: boolean;
    expiresAt?: string;
    loadId?: string;
    shipmentId?: string;
    tagsInput: string;
  }>({
    type: 'BOL',
    isVerified: false,
    expiresAt: undefined,
    loadId: '',
    shipmentId: '',
    tagsInput: ''
  });
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [selectedType]);

  useEffect(() => {
    if (!activeDocument) {
      return;
    }
    setMetadataDraft({
      type: activeDocument.type,
      isVerified: activeDocument.isVerified,
      expiresAt: activeDocument.expiresAt ? activeDocument.expiresAt.split('T')[0] : undefined,
      loadId: activeDocument.loadId ?? '',
      shipmentId: activeDocument.shipmentId ?? '',
      tagsInput: (activeDocument.tags ?? []).join(', '),
    });
  }, [activeDocument]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const params: DocumentListParams | undefined =
        selectedType !== 'ALL' ? { type: selectedType as DocumentType } : undefined;
      const response = await documentService.listDocuments(params);
      if (response.success && Array.isArray(response.data)) {
        const docs = response.data;
        setDocuments(docs);
        setSelectedDocuments((prev) => {
          const allowed = new Set(docs.map((doc) => doc._id));
          return prev.filter((id) => allowed.has(id));
        });
      }
    } catch (error: unknown) {
      addNotification({ type: 'error', message: getErrorMessage(error, 'Failed to load documents') });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setSelectedType('ALL');
    setSelectedTags([]);
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

  const filteredDocuments = useMemo(() => {
    if (!documents.length) return [];

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const startTimestamp = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : undefined;
    const endTimestamp = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : undefined;

    return documents.filter((doc) => {
      const matchesType = selectedType === 'ALL' || doc.type === selectedType;
      const matchesSearch =
        !normalizedSearch ||
        doc.originalName.toLowerCase().includes(normalizedSearch) ||
        doc.type.toLowerCase().includes(normalizedSearch) ||
        (doc.loadId?.toLowerCase().includes(normalizedSearch) ?? false) ||
        (doc.shipmentId?.toLowerCase().includes(normalizedSearch) ?? false);

      const uploadedTimestamp = new Date(doc.uploadedAt).getTime();
      const matchesStart = startTimestamp === undefined || uploadedTimestamp >= startTimestamp;
      const matchesEnd = endTimestamp === undefined || uploadedTimestamp <= endTimestamp;

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) =>
          (doc.tags ?? []).some((documentTag) => documentTag.toLowerCase() === tag.toLowerCase())
        );

      return matchesType && matchesSearch && matchesStart && matchesEnd && matchesTags;
    });
  }, [documents, selectedType, searchTerm, startDate, endDate, selectedTags]);

  const hasActiveFilters =
    selectedType !== 'ALL' ||
    Boolean(searchTerm.trim()) ||
    Boolean(startDate) ||
    Boolean(endDate) ||
    selectedTags.length > 0;
  const totalDocuments = documents.length;
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    documents.forEach((doc) => {
      doc.tags?.forEach((tag) => {
        if (tag) {
          tagSet.add(tag);
        }
      });
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [documents]);
  const selectedCount = selectedDocuments.length;
  const isAllSelected =
    filteredDocuments.length > 0 &&
    filteredDocuments.every((doc) => selectedDocuments.includes(doc._id));

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (filteredDocuments.length === 0) {
      return;
    }
    setSelectedDocuments((prev) => {
      const filteredIds = filteredDocuments.map((doc) => doc._id);
      const allSelected = filteredIds.every((id) => prev.includes(id));
      if (allSelected) {
        return prev.filter((id) => !filteredIds.includes(id));
      }
      const merged = new Set([...prev, ...filteredIds]);
      return Array.from(merged);
    });
  };

  const clearSelection = () => setSelectedDocuments([]);

  const toggleTagFilter = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((value) => value !== tag) : [...prev, tag]
    );
  };

  const performBulkAction = async (
    action: DocumentBulkAction,
    extra?: { tags?: string[] }
  ) => {
    if (selectedDocuments.length === 0) return;

    setIsBulkActionLoading(true);
    try {
      await documentService.bulkUpdateDocuments({
        documentIds: selectedDocuments,
        action,
        ...(extra?.tags ? { tags: extra.tags } : {}),
      });
      addNotification({
        type: 'success',
        message: `Bulk action "${action}" completed successfully.`,
      });
      clearSelection();
      await loadDocuments();
    } catch (error: unknown) {
      addNotification({
        type: 'error',
        message: getErrorMessage(error, 'Bulk document action failed'),
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedDocuments.length === 0) return;
    setIsBulkActionLoading(true);
    try {
      const docsToDownload = documents.filter((doc) => selectedDocuments.includes(doc._id));
      for (const doc of docsToDownload) {
        const blob = await documentService.downloadDocument(doc._id);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      addNotification({
        type: 'success',
        message: `Downloading ${docsToDownload.length} document${docsToDownload.length === 1 ? '' : 's'}.`,
      });
    } catch (error: unknown) {
      addNotification({
        type: 'error',
        message: getErrorMessage(error, 'Failed to download selected documents'),
      });
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkTagSubmit = async () => {
    const sanitized = bulkTagInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    await performBulkAction('tag', { tags: sanitized });
    setBulkTagInput('');
    setShowBulkTagModal(false);
  };

  const handleBulkVerify = () => performBulkAction('verify');

  const handleBulkUnverify = () => performBulkAction('unverify');

  const handleBulkDelete = () => {
    if (selectedDocuments.length === 0) return;
    const confirmed = window.confirm(
      `Delete ${selectedDocuments.length} document${selectedDocuments.length === 1 ? '' : 's'}? This action cannot be undone.`
    );
    if (!confirmed) return;
    void performBulkAction('delete');
  };

  const closeMetadataModal = () => {
    setActiveDocument(null);
    setIsSavingMetadata(false);
  };

  const handleMetadataSave = async () => {
    if (!activeDocument) return;
    setIsSavingMetadata(true);
    try {
      const tagsArray = metadataDraft.tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const response = await documentService.updateDocument(activeDocument._id, {
        type: metadataDraft.type,
        isVerified: metadataDraft.isVerified,
        expiresAt: metadataDraft.expiresAt || undefined,
        loadId: metadataDraft.loadId?.trim() || undefined,
        shipmentId: metadataDraft.shipmentId?.trim() || undefined,
        tags: tagsArray.length ? tagsArray : undefined,
      });
      if (response.success) {
        addNotification({ type: 'success', message: 'Document metadata updated' });
        await loadDocuments();
        closeMetadataModal();
      } else {
        addNotification({
          type: 'error',
          message: response.error || 'Failed to update document metadata',
        });
      }
    } catch (error: unknown) {
      addNotification({
        type: 'error',
        message: getErrorMessage(error, 'Failed to update document metadata'),
      });
    } finally {
      setIsSavingMetadata(false);
    }
  };

  const renderDocumentsContent = () => {
    if (isLoading) {
      if (viewMode === 'grid') {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm animate-pulse space-y-4"
              >
                <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="flex gap-2">
                  <div className="h-9 flex-1 bg-gray-200 rounded" />
                  <div className="h-9 flex-1 bg-gray-200 rounded" />
                  <div className="h-9 w-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="p-4 md:p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (filteredDocuments.length === 0) {
      if (totalDocuments === 0) {
        return (
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
        );
      }

      return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Filter className="h-10 w-10 text-blue-500" />
          </div>
          <p className="text-gray-700 text-lg font-semibold mb-2">No documents match your filters</p>
          <p className="text-gray-500 text-sm mb-6">
            Try adjusting your search term or date range to broaden the results.
          </p>
          <button
            onClick={resetFilters}
            className="bg-transparent border border-blue-200 text-blue-700 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Clear Filters
          </button>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc, index) => {
            const isSelected = selectedDocuments.includes(doc._id);
            return (
              <div
                key={doc._id}
                className={`rounded-2xl border bg-white p-5 transition-all duration-300 ${
                  isSelected
                    ? 'border-emerald-400 shadow-xl ring-2 ring-emerald-100'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-lg'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleDocumentSelection(doc._id)}
                      className={`mt-1 transition-colors ${isSelected ? 'text-emerald-600' : 'text-blue-600 hover:text-blue-800'}`}
                      aria-label={isSelected ? 'Deselect document' : 'Select document'}
                    >
                      {isSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-3xl">{getFileIcon(doc.mimeType)}</div>
                        <h3 className="max-w-[16rem] break-words text-sm font-semibold leading-tight text-gray-900">
                          {doc.originalName}
                        </h3>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 font-semibold text-gray-700">
                          {doc.type}
                        </span>
                        <span>{formatFileSize(doc.size)}</span>
                        <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        {doc.isVerified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        )}
                        {doc.expiresAt && (
                          <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 font-semibold text-orange-700">
                            Expires {new Date(doc.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveDocument(doc)}
                    className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    <span className="inline-flex items-center gap-1">
                      <Edit className="h-3.5 w-3.5" />
                      Manage
                    </span>
                  </button>
                </div>
                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  {doc.loadId && (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-500">Load ID</span>
                      <span className="font-semibold text-gray-800">{doc.loadId}</span>
                    </div>
                  )}
                  {doc.shipmentId && (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-500">Shipment ID</span>
                      <span className="font-semibold text-gray-800">{doc.shipmentId}</span>
                    </div>
                  )}
                  {doc.tags && doc.tags.length > 0 && (
                    <div>
                      <p className="mb-1 font-semibold uppercase tracking-wide text-gray-500">Tags</p>
                      <div className="flex flex-wrap gap-1.5">
                        {doc.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-[0.7rem] font-semibold text-blue-700">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!doc.tags?.length && !doc.loadId && !doc.shipmentId && (
                    <p className="text-gray-500">No associations or tags yet.</p>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => handleView(doc)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:from-slate-700 hover:to-slate-800 hover:shadow-lg flex items-center justify-center gap-2"
                    title="View Document"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg flex items-center justify-center gap-2"
                    title="Download Document"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all hover:from-red-700 hover:to-red-800 hover:shadow-lg flex items-center justify-center"
                    title="Delete Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="inline-flex items-center gap-2 text-blue-700"
                  >
                    {isAllSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                    All
                  </button>
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredDocuments.map((doc) => {
                const isSelected = selectedDocuments.includes(doc._id);
                return (
                  <tr
                    key={doc._id}
                    className={`transition-colors ${isSelected ? 'bg-emerald-50' : 'hover:bg-blue-50/50'}`}
                  >
                    <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleDocumentSelection(doc._id)}
                        className={`text-blue-700 transition-colors ${isSelected ? 'text-emerald-600' : 'hover:text-blue-900'}`}
                        aria-label={isSelected ? 'Deselect document' : 'Select document'}
                      >
                        {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
                        <div>
                          <div className="max-w-xs truncate text-sm font-semibold text-gray-900">
                            {doc.originalName}
                          </div>
                          {(doc.loadId || doc.shipmentId) && (
                            <div className="mt-1 text-xs text-gray-500 space-x-2">
                              {doc.loadId && <span>Load: {doc.loadId}</span>}
                              {doc.shipmentId && <span>Shipment: {doc.shipmentId}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                      <span className="rounded px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100">
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 whitespace-nowrap text-xs text-gray-600">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-gray-700">
                          {doc.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Verified
                            </span>
                          ) : (
                            'Pending review'
                          )}
                        </span>
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.map((tag) => (
                              <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold text-blue-700">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {doc.expiresAt && (
                          <span className="text-orange-600 font-semibold">
                            Expires {new Date(doc.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-600">
                      {formatFileSize(doc.size)}
                    </td>
                    <td className="px-4 md:px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleView(doc)}
                          className="rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 px-3 py-2 text-white shadow-md transition-all hover:from-slate-700 hover:to-slate-800 hover:shadow-lg"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 text-white shadow-md transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setActiveDocument(doc)}
                          className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50"
                          title="Manage metadata"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-3 py-2 text-white shadow-md transition-all hover:from-red-700 hover:to-red-800 hover:shadow-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
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
            <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search name, type, load or shipment"
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                  />
                </div>
                <div className="relative">
                  <Filter className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From</span>
                  <div className="relative mt-1">
                    <Calendar className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={startDate}
                      max={endDate || undefined}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="w-full pl-9 pr-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</span>
                  <div className="relative mt-1">
                    <Calendar className="h-4 w-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(event) => setEndDate(event.target.value)}
                      className="w-full pl-9 pr-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
                    />
                  </div>
                </div>
                {availableTags.length > 0 && (
                  <div className="md:col-span-2 xl:col-span-4">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <Tag className="h-4 w-4" />
                      Tags
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => toggleTagFilter(tag)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow'
                                : 'border border-blue-200 text-blue-700 bg-white hover:bg-blue-50'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                      {selectedTags.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedTags([])}
                          className="rounded-full px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50"
                        >
                          Clear tags
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <div className="text-sm text-gray-600">
                  {hasActiveFilters ? (
                    <span>
                      Showing <span className="font-semibold text-gray-900">{filteredDocuments.length}</span> of{' '}
                      <span className="font-semibold text-gray-900">{totalDocuments}</span> documents
                    </span>
                  ) : (
                    <span>
                      You have <span className="font-semibold text-gray-900">{totalDocuments}</span> documents
                      available
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-300 ${
                      hasActiveFilters
                        ? 'border-blue-200 text-blue-700 hover:bg-blue-50'
                        : 'border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
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
            </div>

            {selectedCount > 0 && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <CheckSquare className="h-4 w-4" />
                  {selectedCount} document{selectedCount === 1 ? '' : 's'} selected
                  {isAllSelected && <span className="text-xs text-blue-500">(all filtered)</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    {isAllSelected ? 'Clear filtered selection' : 'Select filtered'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkVerify}
                    disabled={isBulkActionLoading}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {isBulkActionLoading ? 'Working…' : 'Mark verified'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkUnverify}
                    disabled={isBulkActionLoading}
                    className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    Unverify
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBulkTagModal(true)}
                    disabled={isBulkActionLoading}
                    className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    Tag
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDownload}
                    disabled={isBulkActionLoading}
                    className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={isBulkActionLoading}
                    className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Documents Grid/List */}
            {renderDocumentsContent()}
          </div>
        </div>
      </div>

      {showBulkTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Apply tags to selected documents</h3>
              <button
                type="button"
                onClick={() => {
                  setShowBulkTagModal(false);
                  setBulkTagInput('');
                }}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-5">
              <p className="text-sm text-gray-600">
                Enter comma-separated tags. Leave the field blank to clear tags on the selected documents.
              </p>
              <input
                type="text"
                value={bulkTagInput}
                onChange={(event) => setBulkTagInput(event.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="e.g. invoice, bol, compliance"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkTagModal(false);
                    setBulkTagInput('');
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  disabled={isBulkActionLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkTagSubmit}
                  disabled={isBulkActionLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                  {isBulkActionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Apply tags
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Manage document</h3>
                <p className="max-w-[22rem] truncate text-sm text-gray-500">{activeDocument.originalName}</p>
              </div>
              <button
                type="button"
                onClick={closeMetadataModal}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-6 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Document type
                  </label>
                  <select
                    value={metadataDraft.type}
                    onChange={(event) =>
                      setMetadataDraft((prev) => ({ ...prev, type: event.target.value as DocumentType }))
                    }
                    className="mt-1 w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Expiration date
                  </label>
                  <input
                    type="date"
                    value={metadataDraft.expiresAt ?? ''}
                    onChange={(event) =>
                      setMetadataDraft((prev) => ({ ...prev, expiresAt: event.target.value || undefined }))
                    }
                    className="mt-1 w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="document-verified"
                  type="checkbox"
                  checked={metadataDraft.isVerified}
                  onChange={(event) =>
                    setMetadataDraft((prev) => ({ ...prev, isVerified: event.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="document-verified" className="text-sm font-semibold text-gray-700">
                  Mark as verified
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Linked load ID
                  </label>
                  <input
                    type="text"
                    value={metadataDraft.loadId ?? ''}
                    onChange={(event) =>
                      setMetadataDraft((prev) => ({ ...prev, loadId: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Linked shipment ID
                  </label>
                  <input
                    type="text"
                    value={metadataDraft.shipmentId ?? ''}
                    onChange={(event) =>
                      setMetadataDraft((prev) => ({ ...prev, shipmentId: event.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tags</label>
                <input
                  type="text"
                  value={metadataDraft.tagsInput}
                  onChange={(event) =>
                    setMetadataDraft((prev) => ({ ...prev, tagsInput: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Comma separated list"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-5">
              <button
                type="button"
                onClick={closeMetadataModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                disabled={isSavingMetadata}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMetadataSave}
                disabled={isSavingMetadata}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {isSavingMetadata && <Loader2 className="h-4 w-4 animate-spin" />}
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Documents;


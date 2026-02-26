import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DocumentManager = ({ property, token, userRole }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchDocuments = async () => {
    try {
      const response = await api.get(`/api/documents/property/${property._id}`);
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  useEffect(() => {
    if (property && property._id) {
      fetchDocuments();
    }
  }, [property]);

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });
    formData.append('propertyId', property._id);

    try {
      const response = await api.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setDocuments(prev => [...prev, ...response.data.documents]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload documents');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/api/documents/${docId}`);
      setDocuments(prev => prev.filter(doc => doc._id !== docId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete document');
    }
  };

  const handleDownloadDocument = (doc) => {
    window.open(`http://localhost:5000${doc.url}`, '_blank');
  };

  const getDocumentIcon = (type) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const getDocumentTypeLabel = (type) => {
    if (type === 'agreement') return 'Rental Agreement';
    if (type === 'id-proof') return 'ID Proof';
    if (type === 'address-proof') return 'Address Proof';
    if (type === 'police-verification') return 'Police Verification';
    if (type === 'maintenance') return 'Maintenance Record';
    if (type === 'other') return 'Other';
    return 'Document';
  };

  return (
    <div className="card">
      <h3>Document Management</h3>
      
      {/* Upload Section */}
      {(userRole === 'owner' || userRole === 'admin') && (
        <div style={{ marginBottom: '1rem' }}>
          <label className="btn btn-outline" style={{ 
            pointerEvents: 'auto', 
            zIndex: 10, 
            position: 'relative',
            display: 'inline-block'
          }}>
            {uploading ? 'Uploading...' : 'Upload Documents'}
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleDocumentUpload}
              disabled={uploading}
              style={{
                position: 'absolute',
                opacity: 0,
                width: '100%',
                height: '100%',
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            />
          </label>
          <small style={{ marginLeft: '1rem', color: '#6b7280' }}>
            PDF, DOC, DOCX, JPG, PNG files allowed
          </small>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 ? (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {documents.map((doc) => (
            <div
              key={doc._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#f9fafb'
              }}
            >
              <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>
                {getDocumentIcon(doc.mimeType)}
              </span>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {doc.originalName}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                  {getDocumentTypeLabel(doc.type)} • 
                  {(doc.size / 1024 / 1024).toFixed(2)} MB • 
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn btn-small"
                  onClick={() => handleDownloadDocument(doc)}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  Download
                </button>
                
                {(userRole === 'owner' || userRole === 'admin') && (
                  <button
                    className="btn btn-small btn-ghost"
                    onClick={() => handleDeleteDocument(doc._id)}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#6b7280',
          border: '2px dashed #e5e7eb',
          borderRadius: '8px'
        }}>
          No documents uploaded yet.
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedDoc(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '90%',
              maxHeight: '90%',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn btn-outline"
              onClick={() => setSelectedDoc(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                pointerEvents: 'auto',
                zIndex: 10
              }}
            >
              × Close
            </button>
            
            {selectedDoc.mimeType.includes('image') ? (
              <img
                src={`http://localhost:5000${selectedDoc.url}`}
                alt="Document preview"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {getDocumentIcon(selectedDoc.mimeType)}
                </div>
                <h3>{selectedDoc.originalName}</h3>
                <p>Preview not available for this file type</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDownloadDocument(selectedDoc)}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  Download to View
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;

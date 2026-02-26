import React, { useState } from 'react';
import axios from 'axios';

const ImageGallery = ({ property, token, onImageUpdate }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await api.post(`/api/owner/properties/${property._id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (onImageUpdate) {
        onImageUpdate(response.data.property);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/api/owner/properties/${property._id}/images/${imageId}`);
      
      if (onImageUpdate) {
        onImageUpdate({ ...property, images: property.images.filter(img => img._id !== imageId) });
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete image');
    }
  };

  const images = property.images || [];

  return (
    <div className="card">
      <h3>Property Images</h3>
      
      {/* Upload Section */}
      <div style={{ marginBottom: '1rem' }}>
        <label className="btn btn-outline" style={{ 
          pointerEvents: 'auto', 
          zIndex: 10, 
          position: 'relative',
          display: 'inline-block'
        }}>
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
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
          Max 10 images, 5MB each
        </small>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {images.map((image) => (
            <div key={image._id} style={{ 
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}>
              <img
                src={`http://localhost:5000${image.url}`}
                alt="Property"
                style={{
                  width: '100%',
                  height: '120px',
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedImage(image)}
              />
              <button
                className="btn btn-small btn-ghost"
                onClick={() => handleDeleteImage(image._id)}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  zIndex: 10
                }}
              >
                ×
              </button>
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
          No images uploaded yet. Add images to showcase your property.
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
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
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={`http://localhost:5000${selectedImage.url}`}
            alt="Property full size"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
          <button
            className="btn btn-outline"
            onClick={() => setSelectedImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              color: 'black',
              pointerEvents: 'auto',
              zIndex: 10
            }}
          >
            × Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

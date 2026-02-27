import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MaintenanceSystem = ({ property, token, userRole }) => {
  const [requests, setRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'plumbing',
    images: []
  });

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    if (property && property._id) {
      fetchMaintenanceRequests();
    }
  }, [property]);

  const fetchMaintenanceRequests = async () => {
    try {
      const response = await api.get(`/maintenance/property/${property._id}`);
      setRequests(response.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch maintenance requests:', err);
    }
  };

  const createMaintenanceRequest = async () => {
    try {
      const response = await api.post('/maintenance/requests', {
        propertyId: property._id,
        ...formData
      });
      
      setRequests(prev => [response.data.request, ...prev]);
      setShowRequestModal(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'plumbing',
        images: []
      });
    } catch (err) {
      console.error('Failed to create maintenance request:', err);
    }
  };

  const updateRequestStatus = async (requestId, status) => {
    try {
      await api.patch(`/maintenance/requests/${requestId}`, { status });
      fetchMaintenanceRequests();
    } catch (err) {
      console.error('Failed to update request status:', err);
    }
  };

  const addComment = async (requestId, comment) => {
    try {
      await api.post(`/maintenance/requests/${requestId}/comments`, { comment });
      fetchMaintenanceRequests();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'in_progress':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'plumbing':
        return '🔧';
      case 'electrical':
        return '⚡';
      case 'hvac':
        return '❄️';
      case 'appliances':
        return '🏠';
      case 'structural':
        return '🏗️';
      case 'pest_control':
        return '🐜';
      case 'cleaning':
        return '🧹';
      case 'landscaping':
        return '🌳';
      default:
        return '🔨';
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Maintenance Requests</h3>
        {userRole === 'tenant' && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowRequestModal(true)}
            style={{ pointerEvents: 'auto', zIndex: 10 }}
          >
            New Request
          </button>
        )}
      </div>

      <div className="maintenance-requests">
        {requests.length > 0 ? (
          requests.map(request => (
            <div key={request._id} className="maintenance-request">
              <div className="request-header">
                <div className="request-title">
                  <span className="category-icon">{getCategoryIcon(request.category)}</span>
                  <h4>{request.title}</h4>
                </div>
                <div className="request-badges">
                  <span 
                    className="badge" 
                    style={{ backgroundColor: getPriorityColor(request.priority) }}
                  >
                    {request.priority}
                  </span>
                  <span 
                    className="badge" 
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <p className="request-description">{request.description}</p>
              
              <div className="request-meta">
                <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                <span>By: {request.requestedBy.name}</span>
              </div>

              {request.images && request.images.length > 0 && (
                <div className="request-images">
                  {request.images.map((image, index) => (
                    <img
                      key={index}
                      src={`http://localhost:5000${image}`}
                      alt="Maintenance issue"
                      className="request-image"
                      onClick={() => window.open(`http://localhost:5000${image}`, '_blank')}
                    />
                  ))}
                </div>
              )}

              {request.comments && request.comments.length > 0 && (
                <div className="request-comments">
                  <h5>Comments</h5>
                  {request.comments.map((comment, index) => (
                    <div key={index} className="comment">
                      <div className="comment-header">
                        <strong>{comment.author.name}</strong>
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p>{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="request-actions">
                {userRole === 'owner' && request.status === 'pending' && (
                  <button 
                    className="btn btn-small"
                    onClick={() => updateRequestStatus(request._id, 'in_progress')}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    Start Work
                  </button>
                )}
                
                {userRole === 'owner' && request.status === 'in_progress' && (
                  <button 
                    className="btn btn-small"
                    onClick={() => updateRequestStatus(request._id, 'completed')}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    Mark Complete
                  </button>
                )}

                <button 
                  className="btn btn-small btn-outline"
                  onClick={() => setSelectedRequest(request)}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No maintenance requests found.
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showRequestModal && (
        <div className="modal" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Maintenance Request</h4>
            <form onSubmit={(e) => { e.preventDefault(); createMaintenanceRequest(); }}>
              <div className="form-grid">
                <label>
                  Title
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  />
                </label>
                
                <label>
                  Category
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliances">Appliances</option>
                    <option value="structural">Structural</option>
                    <option value="pest_control">Pest Control</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="landscaping">Landscaping</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                
                <label>
                  Priority
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </label>
              </div>
              
              <label style={{ marginTop: '1rem' }}>
                Description
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    resize: 'vertical',
                    pointerEvents: 'auto',
                    zIndex: 10
                  }}
                />
              </label>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  Submit Request
                </button>
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowRequestModal(false)}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="modal" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Maintenance Request Details</h4>
            <div className="request-details">
              <h5>{selectedRequest.title}</h5>
              <p>{selectedRequest.description}</p>
              
              <div className="request-meta-grid">
                <div>
                  <strong>Category:</strong> {selectedRequest.category}
                </div>
                <div>
                  <strong>Priority:</strong> {selectedRequest.priority}
                </div>
                <div>
                  <strong>Status:</strong> {selectedRequest.status.replace('_', ' ')}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="comment-section">
                <h5>Add Comment</h5>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Type your comment..."
                    id="comment-input"
                    style={{ 
                      flex: 1, 
                      padding: '0.5rem', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      pointerEvents: 'auto',
                      zIndex: 10
                    }}
                  />
                  <button 
                    className="btn btn-small"
                    onClick={() => {
                      const input = document.getElementById('comment-input');
                      if (input.value.trim()) {
                        addComment(selectedRequest._id, input.value);
                        input.value = '';
                      }
                    }}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              className="btn btn-outline"
              onClick={() => setSelectedRequest(null)}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .maintenance-requests {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .maintenance-request {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1rem;
          background: #fafafa;
        }

        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .request-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .request-title h4 {
          margin: 0;
          font-size: 1rem;
        }

        .category-icon {
          font-size: 1.2rem;
        }

        .request-badges {
          display: flex;
          gap: 0.5rem;
        }

        .request-description {
          margin: 0.5rem 0;
          color: #4b5563;
        }

        .request-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 0.75rem;
        }

        .request-images {
          display: flex;
          gap: 0.5rem;
          margin: 0.75rem 0;
        }

        .request-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .request-image:hover {
          transform: scale(1.05);
        }

        .request-comments {
          margin: 1rem 0;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .request-comments h5 {
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
          color: #374151;
        }

        .comment {
          margin-bottom: 0.75rem;
          padding: 0.5rem;
          background: white;
          border-radius: 0.5rem;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .comment p {
          margin: 0;
          font-size: 0.875rem;
        }

        .request-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .request-details {
          margin: 1rem 0;
        }

        .request-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin: 1rem 0;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .comment-section {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .comment-section h5 {
          margin: 0 0 0.75rem 0;
          font-size: 0.875rem;
          color: #374151;
        }
      `}</style>
    </div>
  );
};

export default MaintenanceSystem;

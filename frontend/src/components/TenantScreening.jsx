import React, { useState, useEffect } from 'react';
import { createAuthenticatedApi } from '../utils/api.js';

const TenantScreening = ({ token, property }) => {
  const [applications, setApplications] = useState([]);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [screeningCriteria, setScreeningCriteria] = useState({
    minCreditScore: 600,
    minIncome: 30000,
    maxDebtToIncome: 0.4,
    requiredReferences: 2,
    backgroundCheck: true
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentAddress: '',
    employer: '',
    position: '',
    income: '',
    creditScore: '',
    references: [],
    documents: []
  });

  // Create authenticated API instance
  const api = createAuthenticatedApi(token);

  useEffect(() => {
    if (property && property._id) {
      fetchApplications();
      fetchScreeningCriteria();
    }
  }, [property]);

  const fetchApplications = async () => {
    try {
      const response = await api.get(`/screening/property/${property._id}/applications`);
      setApplications(response.data.applications || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  };

  const fetchScreeningCriteria = async () => {
    try {
      const response = await api.get(`/screening/property/${property._id}/criteria`);
      setScreeningCriteria(response.data.criteria || screeningCriteria);
    } catch (err) {
      console.error('Failed to fetch screening criteria:', err);
    }
  };

  const submitApplication = async () => {
    try {
      const response = await api.post('/screening/applications', {
        propertyId: property._id,
        ...formData
      });
      
      setApplications(prev => [response.data.application, ...prev]);
      setShowApplicationModal(false);
      resetForm();
    } catch (err) {
      console.error('Failed to submit application:', err);
    }
  };

  const updateScreeningCriteria = async () => {
    try {
      await api.put(`/screening/property/${property._id}/criteria`, screeningCriteria);
    } catch (err) {
      console.error('Failed to update screening criteria:', err);
    }
  };

  const processApplication = async (applicationId, decision, notes) => {
    try {
      await api.post(`/screening/applications/${applicationId}/process`, {
        decision,
        notes
      });
      fetchApplications();
    } catch (err) {
      console.error('Failed to process application:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      currentAddress: '',
      employer: '',
      position: '',
      income: '',
      creditScore: '',
      references: [],
      documents: []
    });
  };

  const addReference = () => {
    setFormData(prev => ({
      ...prev,
      references: [...prev.references, { name: '', phone: '', email: '', relationship: '' }]
    }));
  };

  const updateReference = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const removeReference = (index) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index)
    }));
  };

  const calculateScreeningScore = (application) => {
    let score = 0;
    const maxScore = 100;

    // Credit Score (40%)
    if (application.creditScore >= screeningCriteria.minCreditScore) {
      score += 40;
    } else {
      score += (application.creditScore / screeningCriteria.minCreditScore) * 40;
    }

    // Income (30%)
    if (application.income >= screeningCriteria.minIncome) {
      score += 30;
    } else {
      score += (application.income / screeningCriteria.minIncome) * 30;
    }

    // References (20%)
    if (application.references.length >= screeningCriteria.requiredReferences) {
      score += 20;
    } else {
      score += (application.references.length / screeningCriteria.requiredReferences) * 20;
    }

    // Background Check (10%)
    if (application.backgroundCheckPassed) {
      score += 10;
    }

    return Math.round(score);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'approved':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'under_review':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Tenant Screening</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowApplicationModal(true)}
          style={{ pointerEvents: 'auto', zIndex: 10 }}
        >
          New Application
        </button>
      </div>

      {/* Screening Criteria */}
      <div className="screening-criteria">
        <h4>Screening Criteria</h4>
        <div className="criteria-grid">
          <label>
            Min Credit Score
            <input
              type="number"
              value={screeningCriteria.minCreditScore}
              onChange={(e) => setScreeningCriteria(prev => ({ ...prev, minCreditScore: parseInt(e.target.value) }))}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            />
          </label>
          <label>
            Min Annual Income
            <input
              type="number"
              value={screeningCriteria.minIncome}
              onChange={(e) => setScreeningCriteria(prev => ({ ...prev, minIncome: parseInt(e.target.value) }))}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            />
          </label>
          <label>
            Max Debt-to-Income Ratio
            <input
              type="number"
              step="0.1"
              value={screeningCriteria.maxDebtToIncome}
              onChange={(e) => setScreeningCriteria(prev => ({ ...prev, maxDebtToIncome: parseFloat(e.target.value) }))}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            />
          </label>
          <label>
            Required References
            <input
              type="number"
              value={screeningCriteria.requiredReferences}
              onChange={(e) => setScreeningCriteria(prev => ({ ...prev, requiredReferences: parseInt(e.target.value) }))}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            />
          </label>
        </div>
        <button 
          className="btn btn-small btn-outline"
          onClick={updateScreeningCriteria}
          style={{ pointerEvents: 'auto', zIndex: 10 }}
        >
          Update Criteria
        </button>
      </div>

      {/* Applications List */}
      <div className="applications-list">
        {applications.length > 0 ? (
          applications.map(application => (
            <div key={application._id} className="application-card">
              <div className="application-header">
                <div>
                  <h4>{application.fullName}</h4>
                  <p>{application.email} • {application.phone}</p>
                </div>
                <div className="application-score">
                  <div 
                    className="score-circle"
                    style={{ 
                      borderColor: getScoreColor(calculateScreeningScore(application)),
                      color: getScoreColor(calculateScreeningScore(application))
                    }}
                  >
                    {calculateScreeningScore(application)}%
                  </div>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(application.status) }}
                  >
                    {application.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="application-details">
                <div className="detail-grid">
                  <div>
                    <strong>Income:</strong> ${application.income?.toLocaleString() || 'N/A'}
                  </div>
                  <div>
                    <strong>Credit Score:</strong> {application.creditScore || 'N/A'}
                  </div>
                  <div>
                    <strong>Employer:</strong> {application.employer || 'N/A'}
                  </div>
                  <div>
                    <strong>Position:</strong> {application.position || 'N/A'}
                  </div>
                </div>

                <div className="references-section">
                  <h5>References ({application.references?.length || 0})</h5>
                  {application.references?.map((ref, index) => (
                    <div key={index} className="reference-item">
                      <span>{ref.name}</span>
                      <span>{ref.relationship}</span>
                      <span>{ref.phone}</span>
                    </div>
                  ))}
                </div>

                <div className="screening-results">
                  <h5>Screening Results</h5>
                  <div className="result-item">
                    <span>Credit Score Check</span>
                    <span className={application.creditScore >= screeningCriteria.minCreditScore ? 'pass' : 'fail'}>
                      {application.creditScore >= screeningCriteria.minCreditScore ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </div>
                  <div className="result-item">
                    <span>Income Verification</span>
                    <span className={application.income >= screeningCriteria.minIncome ? 'pass' : 'fail'}>
                      {application.income >= screeningCriteria.minIncome ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </div>
                  <div className="result-item">
                    <span>References Check</span>
                    <span className={application.references?.length >= screeningCriteria.requiredReferences ? 'pass' : 'fail'}>
                      {application.references?.length >= screeningCriteria.requiredReferences ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </div>
                  <div className="result-item">
                    <span>Background Check</span>
                    <span className={application.backgroundCheckPassed ? 'pass' : 'fail'}>
                      {application.backgroundCheckPassed ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="application-actions">
                {application.status === 'pending' && (
                  <>
                    <button 
                      className="btn btn-small"
                      onClick={() => processApplication(application._id, 'approved', 'Application approved')}
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn btn-small btn-ghost"
                      onClick={() => processApplication(application._id, 'rejected', 'Application rejected')}
                      style={{ pointerEvents: 'auto', zIndex: 10 }}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button 
                  className="btn btn-small btn-outline"
                  onClick={() => setSelectedApplication(application)}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No applications received yet.
          </div>
        )}
      </div>

      {/* New Application Modal */}
      {showApplicationModal && (
        <div className="modal" onClick={() => setShowApplicationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Rental Application</h4>
            <form onSubmit={(e) => { e.preventDefault(); submitApplication(); }}>
              <div className="form-grid">
                <label>
                  Full Name
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    required
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  />
                </label>
                <label>
                  Current Address
                  <input
                    type="text"
                    value={formData.currentAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAddress: e.target.value }))}
                    required
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  />
                </label>
                <label>
                  Employer
                  <input
                    type="text"
                    value={formData.employer}
                    onChange={(e) => setFormData(prev => ({ ...prev, employer: e.target.value }))}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  />
                </label>
                <label>
                  Position
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  />
                </label>
                <label>
                  Annual Income
                  <input
                    type="number"
                    value={formData.income}
                    onChange={(e) => setFormData(prev => ({ ...prev, income: parseInt(e.target.value) }))}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  />
                </label>
                <label>
                  Credit Score
                  <input
                    type="number"
                    value={formData.creditScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, creditScore: parseInt(e.target.value) }))}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  />
                </label>
              </div>

              <div className="references-section">
                <h5>References</h5>
                {formData.references.map((ref, index) => (
                  <div key={index} className="reference-form">
                    <div className="form-grid">
                      <input
                        type="text"
                        placeholder="Name"
                        value={ref.name}
                        onChange={(e) => updateReference(index, 'name', e.target.value)}
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
                      />
                      <input
                        type="text"
                        placeholder="Relationship"
                        value={ref.relationship}
                        onChange={(e) => updateReference(index, 'relationship', e.target.value)}
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={ref.phone}
                        onChange={(e) => updateReference(index, 'phone', e.target.value)}
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
                      />
                      <button 
                        type="button"
                        className="btn btn-small btn-ghost"
                        onClick={() => removeReference(index)}
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button 
                  type="button"
                  className="btn btn-small btn-outline"
                  onClick={addReference}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  Add Reference
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  Submit Application
                </button>
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowApplicationModal(false)}
                  style={{ pointerEvents: 'auto', zIndex: 10 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .screening-criteria {
          background: #f9fafb;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .criteria-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }

        .applications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .application-card {
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 1rem;
          background: white;
        }

        .application-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .application-header h4 {
          margin: 0;
          font-size: 1.1rem;
        }

        .application-header p {
          margin: 0.25rem 0 0 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .application-score {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .score-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.875rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .application-details {
          margin: 1rem 0;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .references-section {
          margin: 1rem 0;
        }

        .references-section h5 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #374151;
        }

        .reference-item {
          display: flex;
          gap: 1rem;
          padding: 0.5rem;
          background: #f9fafb;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }

        .reference-form {
          margin-bottom: 0.5rem;
        }

        .screening-results {
          margin: 1rem 0;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 0.5rem;
        }

        .screening-results h5 {
          margin: 0 0 0.5rem 0;
          font-size: 0.875rem;
          color: #374151;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.25rem 0;
          font-size: 0.875rem;
        }

        .pass {
          color: #10b981;
          font-weight: 600;
        }

        .fail {
          color: #ef4444;
          font-weight: 600;
        }

        .application-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default TenantScreening;

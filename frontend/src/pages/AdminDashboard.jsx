import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { createAuthenticatedApi } from "../utils/api.js";
import MessagingSystem from "../components/MessagingSystem.jsx";

const AdminDashboard = () => {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'users', 'agreements', 'active-rent', 'messages'
  const [loading, setLoading] = useState(false);
  const [selectedAgreements, setSelectedAgreements] = useState([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [activeRentUpdated, setActiveRentUpdated] = useState(false);

  // Check if user is admin
  if (user && user.role !== 'admin') {
    console.error('Access denied: User is not an admin', user.role);
    alert('Access denied: Only admin users can access this dashboard.');
    logout();
    return null;
  }

  // Create authenticated API instance
  const api = createAuthenticatedApi(token);

  // Test API connection immediately
  useEffect(() => {
    if (token) {
      console.log('Testing API connection...');
      console.log('API baseURL:', api.defaults.baseURL);
      console.log('API headers:', api.defaults.headers);
      
      api.get('/admin/users')
        .then(response => {
          console.log('API connection successful:', response.data);
        })
        .catch(err => {
          console.error('API connection failed:', err);
          console.error('API error details:', err.response?.data || err.message);
        });
    }
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading admin data...');
      console.log('Token:', token?.substring(0, 20) + '...');
      
      // Load users first
      const usersRes = await api.get("/admin/users");
      console.log('Users response:', usersRes.data);
      setUsers(usersRes.data.users || []);
      
      // Load agreements separately with better error handling
      try {
        const pendingRes = await api.get("/admin/agreements/pending");
        console.log('Pending agreements response:', pendingRes.data);
        setPendingAgreements(pendingRes.data.agreements || []);
      } catch (agreementErr) {
        console.error('Failed to load agreements:', agreementErr);
        setPendingAgreements([]);
      }
      
      // Load active rentals separately
      try {
        const activeRes = await api.get("/admin/agreements/active");
        console.log('Active rentals response:', activeRes.data);
        setActiveRentals(activeRes.data.agreements || []);
      } catch (activeErr) {
        console.error('Failed to load active rentals:', activeErr);
        setActiveRentals([]);
      }
      
      // Load analytics separately
      try {
        const analyticsRes = await api.get("/admin/analytics/overview");
        console.log('Analytics response:', analyticsRes.data);
        setAnalytics(analyticsRes.data);
      } catch (analyticsErr) {
        console.error('Failed to load analytics:', analyticsErr);
        setAnalytics(null);
      }
      
      console.log('State updated successfully');
    } catch (err) {
      console.error('Failed to load admin data:', err);
      console.error('Error details:', err.response?.data || err.message);
      alert(`Failed to load admin dashboard data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData().catch(console.error);
    }
  }, [token]);

  const toggleUser = async (id) => {
    try {
      console.log('Toggling user:', id);
      const response = await api.patch(`/admin/users/${id}/toggle`);
      console.log('Toggle response:', response.data);
      await loadData();
      alert('User status updated successfully!');
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      alert(`Failed to update user status: ${err.response?.data?.message || err.message}`);
    }
  };

  const approve = async (id) => {
    if (!window.confirm('Are you sure you want to approve this agreement? This will activate the rental agreement.')) {
      return;
    }
    
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      console.log('Approving agreement:', id);
      console.log('User role:', user?.role);
      console.log('Token present:', !!token);
      console.log('Token length:', token?.length);
      
      const response = await api.post(`/admin/agreements/${id}/approve`);
      console.log('Approve response:', response.data);
      
      // Show success message
      alert(`Agreement approved successfully! Payment schedule created with due date: ${new Date(response.data.firstPayment?.dueDate).toLocaleDateString()}`);
      
      // Remove from pending list
      setPendingAgreements(prev => prev.filter(a => a._id !== id));
      
      // Refresh active rentals
      try {
        const activeRes = await api.get("/admin/agreements/active");
        console.log('Active rentals refreshed:', activeRes.data);
        setActiveRentals(activeRes.data.agreements || []);
        setActiveRentUpdated(true);
        setTimeout(() => setActiveRentUpdated(false), 2000); // Reset after 2 seconds
      } catch (activeErr) {
        console.error('Failed to refresh active rentals:', activeErr);
      }
      
      // Refresh analytics
      try {
        const analyticsRes = await api.get("/admin/analytics/overview");
        setAnalytics(analyticsRes.data);
      } catch (analyticsErr) {
        console.error('Failed to refresh analytics:', analyticsErr);
      }
    } catch (err) {
      console.error('Failed to approve agreement:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error config:', err.config);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to approve agreement';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to approve agreements.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Agreement not found or already processed.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const reject = async (id, reason = '') => {
    const customReason = reason || prompt('Please provide a reason for rejection (optional):');
    if (customReason === null) return; // User cancelled
    
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      console.log('Rejecting agreement:', id, 'Reason:', customReason);
      console.log('User role:', user?.role);
      console.log('Token present:', !!token);
      
      const response = await api.post(`/admin/agreements/${id}/reject`, { reason: customReason });
      console.log('Reject response:', response.data);
      
      // Show success message
      alert(`Agreement rejected successfully!${customReason ? ' Reason: ' + customReason : ''}`);
      
      // Remove from pending list
      setPendingAgreements(prev => prev.filter(a => a._id !== id));
      
      // Refresh active rentals
      try {
        const activeRes = await api.get("/admin/agreements/active");
        console.log('Active rentals refreshed after rejection:', activeRes.data);
        setActiveRentals(activeRes.data.agreements || []);
      } catch (activeErr) {
        console.error('Failed to refresh active rentals:', activeErr);
      }
      
      // Refresh analytics
      try {
        const analyticsRes = await api.get("/admin/analytics/overview");
        setAnalytics(analyticsRes.data);
      } catch (analyticsErr) {
        console.error('Failed to refresh analytics:', analyticsErr);
      }
    } catch (err) {
      console.error('Failed to reject agreement:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to reject agreement';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to reject agreements.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Agreement not found or already processed.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // Bulk approve function
  const bulkApprove = async () => {
    if (selectedAgreements.length === 0) {
      alert('Please select at least one agreement to approve.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to approve ${selectedAgreements.length} agreement(s)?`)) {
      return;
    }
    
    setActionLoading(prev => ({ ...prev, bulk: true }));
    try {
      const promises = selectedAgreements.map(id => 
        api.post(`/admin/agreements/${id}/approve`)
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      alert(`Bulk approval completed: ${successful} approved, ${failed} failed.`);
      
      // Refresh data
      await loadData();
      setSelectedAgreements([]);
    } catch (err) {
      console.error('Bulk approve failed:', err);
      alert('Bulk approval failed. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, bulk: false }));
    }
  };

  // Bulk reject function
  const bulkReject = async () => {
    if (selectedAgreements.length === 0) {
      alert('Please select at least one agreement to reject.');
      return;
    }
    
    const reason = prompt('Please provide a reason for bulk rejection:');
    if (reason === null) return; // User cancelled
    
    setActionLoading(prev => ({ ...prev, bulk: true }));
    try {
      const promises = selectedAgreements.map(id => 
        api.post(`/admin/agreements/${id}/reject`, { reason })
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      alert(`Bulk rejection completed: ${successful} rejected, ${failed} failed.`);
      
      // Refresh data
      await loadData();
      setSelectedAgreements([]);
    } catch (err) {
      console.error('Bulk reject failed:', err);
      alert('Bulk rejection failed. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, bulk: false }));
    }
  };

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedAgreements(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  // Select all
  const selectAll = () => {
    setSelectedAgreements(pendingAgreements.map(a => a._id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedAgreements([]);
  };

  // Test function to create a test agreement
  const createTestAgreement = async () => {
    try {
      console.log('Creating test agreement...');
      const response = await api.post('/owner/agreements', {
        propertyId: '67a3b8e9a1b2c3d4e5f6a7b8', // Test property ID
        tenantEmail: 'test@example.com',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        monthlyRent: 15000,
        securityDeposit: 30000
      });
      console.log('Test agreement created:', response.data);
      await loadData();
      alert('Test agreement created successfully!');
    } catch (err) {
      console.error('Failed to create test agreement:', err);
      alert(`Failed to create test agreement: ${err.response?.data?.message || err.message}`);
    }
  };

  // Test function to load agreements directly
  const loadAgreementsDirectly = async () => {
    try {
      console.log('Loading agreements directly...');
      const response = await api.get('/admin/agreements/pending');
      console.log('Direct agreements response:', response.data);
      setPendingAgreements(response.data.agreements || []);
      alert(`Loaded ${response.data.agreements?.length || 0} agreements`);
    } catch (err) {
      console.error('Failed to load agreements directly:', err);
      alert(`Failed to load agreements: ${err.response?.data?.message || err.message}`);
    }
  };

  // Test function to call test endpoint without auth
  const loadTestAgreements = async () => {
    try {
      console.log('Loading test agreements (no auth)...');
      const response = await fetch('http://localhost:5000/api/admin/test/pending');
      const data = await response.json();
      console.log('Test agreements response:', data);
      setPendingAgreements(data.agreements || []);
      alert(`Test endpoint loaded ${data.agreements?.length || 0} agreements`);
    } catch (err) {
      console.error('Failed to load test agreements:', err);
      alert(`Failed to load test agreements: ${err.message}`);
    }
  };

  // Test function to load users without authentication
  const loadTestUsers = async () => {
    try {
      console.log('Loading test users (no auth)...');
      const response = await fetch('http://localhost:5000/api/admin/test/users');
      const data = await response.json();
      console.log('Test users response:', data);
      setUsers(data.users || []);
      alert(`Test endpoint loaded ${data.users?.length || 0} users`);
    } catch (err) {
      console.error('Failed to load test users:', err);
      alert(`Failed to load test users: ${err.message}`);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Admin Panel</h2>
          <p>{user?.name}</p>
        </div>
        <button className="btn btn-outline" onClick={logout} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          Logout
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
          {['analytics', 'users', 'agreements', 'active-rent', 'messages'].map((tab) => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab)}
              style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
            >
              {tab === 'active-rent' ? 'Active Rent' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'active-rent' && activeRentUpdated && (
                <span style={{ 
                  marginLeft: '0.5rem', 
                  color: '#10b981', 
                  fontSize: '0.8rem',
                  animation: 'pulse 1s infinite'
                }}>
                  ✓ Updated
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analytics' && (
        <>
          {/* Debug Panel */}
          <div className="card" style={{ marginBottom: '1rem', backgroundColor: '#f3f4f6' }}>
            <h4>🔍 Debug Information</h4>
            <div style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
              <p><strong>Users:</strong> {users.length} users loaded</p>
              <p><strong>Pending Agreements:</strong> {pendingAgreements.length} agreements loaded</p>
              <p><strong>Active Rentals:</strong> {activeRentals.length} rentals loaded</p>
              <p><strong>Analytics:</strong> {analytics ? 'Loaded' : 'Not loaded'}</p>
              <p><strong>Token:</strong> {token ? 'Present' : 'Missing'}</p>
              <p><strong>User Role:</strong> {user?.role}</p>
              <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button 
                  className="btn btn-small btn-primary" 
                  onClick={() => {
                    console.log('Manual refresh triggered');
                    loadData();
                  }}
                >
                  🔄 Force Refresh Data
                </button>
                <button 
                  className="btn btn-small btn-outline" 
                  onClick={loadTestUsers}
                  style={{ backgroundColor: '#3b82f6', color: 'white' }}
                >
                  🧪 Load Test Users
                </button>
                <button 
                  className="btn btn-small btn-outline" 
                  onClick={loadTestAgreements}
                  style={{ backgroundColor: '#3b82f6', color: 'white' }}
                >
                  🧪 Load Test Agreements
                </button>
              </div>
            </div>
          </div>
          
          {analytics && (
            <section className="summary-grid">
              <div className="card">
                <h3>Active Rentals</h3>
                <p>{analytics.activeAgreements}</p>
              </div>
              <div className="card">
                <h3>Pending Agreements</h3>
                <p>{analytics.pendingAgreements}</p>
              </div>
              <div className="card">
                <h3>Total Income</h3>
                <p>₹{analytics.totalIncome}</p>
              </div>
            </section>
          )}
        </>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Manage Users ({users.length})</h3>
            <button 
              className="btn btn-small btn-outline" 
              onClick={loadTestUsers}
              style={{ pointerEvents: 'auto', zIndex: 10, backgroundColor: '#3b82f6', color: 'white' }}
            >
              🧪 Load Users (No Auth)
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}>
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-small"
                        onClick={() => toggleUser(u._id)}
                        style={{ 
                          pointerEvents: 'auto', 
                          zIndex: 10,
                          backgroundColor: u.isActive ? '#f59e0b' : '#10b981',
                          color: 'white'
                        }}
                      >
                        {u.isActive ? "🔒 Disable" : "🔓 Enable"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No users found. Click "🧪 Load Users (No Auth)" to load users.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'agreements' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Pending Agreements ({pendingAgreements.length})</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {selectedAgreements.length > 0 && (
                <>
                  <button 
                    className="btn btn-small" 
                    onClick={selectAll}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    ☑️ Select All
                  </button>
                  <button 
                    className="btn btn-small btn-outline" 
                    onClick={clearSelection}
                    style={{ pointerEvents: 'auto', zIndex: 10 }}
                  >
                    ❌ Clear Selection
                  </button>
                  <button 
                    className="btn btn-small" 
                    onClick={bulkApprove}
                    disabled={actionLoading.bulk}
                    style={{ 
                      pointerEvents: 'auto', 
                      zIndex: 10, 
                      backgroundColor: '#10b981', 
                      color: 'white'
                    }}
                  >
                    {actionLoading.bulk ? '⏳ Approving...' : `✅ Approve (${selectedAgreements.length})`}
                  </button>
                  <button 
                    className="btn btn-small btn-ghost" 
                    onClick={bulkReject}
                    disabled={actionLoading.bulk}
                    style={{ 
                      pointerEvents: 'auto', 
                      zIndex: 10,
                      backgroundColor: '#ef4444',
                      color: 'white'
                    }}
                  >
                    {actionLoading.bulk ? '⏳ Rejecting...' : `❌ Reject (${selectedAgreements.length})`}
                  </button>
                </>
              )}
              <button 
                className="btn btn-small btn-outline" 
                onClick={loadTestAgreements}
                style={{ pointerEvents: 'auto', zIndex: 10, backgroundColor: '#3b82f6', color: 'white' }}
              >
                🧪 Test (No Auth)
              </button>
              <button 
                className="btn btn-small btn-outline" 
                onClick={loadAgreementsDirectly}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                🔄 Load Agreements
              </button>
              <button 
                className="btn btn-small btn-outline" 
                onClick={createTestAgreement}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                Create Test Agreement
              </button>
              <button 
                className="btn btn-small btn-outline" 
                onClick={loadData}
                disabled={loading}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Loading agreements...
            </div>
          ) : pendingAgreements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p>No pending agreements found.</p>
              <p>Click "🧪 Test (No Auth)" to load agreements or "Create Test Agreement" to add test data.</p>
            </div>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedAgreements.length === pendingAgreements.length && pendingAgreements.length > 0}
                        onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th>Property</th>
                    <th>Owner</th>
                    <th>Tenant</th>
                    <th>Rent</th>
                    <th>Start Date</th>
                    <th>Duration</th>
                    <th>Security Deposit</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAgreements.map((a) => (
                    <tr key={a._id} style={{ 
                      backgroundColor: selectedAgreements.includes(a._id) ? '#f0f9ff' : 'transparent',
                      border: selectedAgreements.includes(a._id) ? '2px solid #3b82f6' : 'none'
                    }}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedAgreements.includes(a._id)}
                          onChange={() => toggleSelection(a._id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td>{a.property?.title || 'N/A'}</td>
                      <td>
                        <div>
                          <strong>{a.owner?.name || 'N/A'}</strong>
                          <br />
                          <small style={{ color: '#6b7280' }}>{a.owner?.email || 'N/A'}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{a.tenant?.name || 'N/A'}</strong>
                          <br />
                          <small style={{ color: '#6b7280' }}>{a.tenant?.email || 'N/A'}</small>
                        </div>
                      </td>
                      <td>₹{a.monthlyRent?.toLocaleString()}</td>
                      <td>{new Date(a.startDate).toLocaleDateString()}</td>
                      <td>
                        {(() => {
                          const start = new Date(a.startDate);
                          const end = new Date(a.endDate);
                          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                          return `${days} days`;
                        })()}
                      </td>
                      <td>₹{a.securityDeposit?.toLocaleString() || 'N/A'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
                          <button 
                            className="btn btn-small" 
                            onClick={() => approve(a._id)} 
                            disabled={actionLoading[a._id] || actionLoading.bulk}
                            style={{ 
                              pointerEvents: 'auto', 
                              zIndex: 10, 
                              backgroundColor: '#10b981', 
                              color: 'white',
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem'
                            }}
                          >
                            {actionLoading[a._id] ? '⏳' : '✅ Approve'}
                          </button>
                          <button 
                            className="btn btn-small btn-ghost" 
                            onClick={() => reject(a._id)} 
                            disabled={actionLoading[a._id] || actionLoading.bulk}
                            style={{ 
                              pointerEvents: 'auto', 
                              zIndex: 10,
                              backgroundColor: '#ef4444',
                              color: 'white',
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem'
                            }}
                          >
                            {actionLoading[a._id] ? '⏳' : '❌ Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Selection Summary */}
              {selectedAgreements.length > 0 && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#f0f9ff', 
                  border: '1px solid #3b82f6',
                  borderRadius: '0.5rem'
                }}>
                  <strong>Selected {selectedAgreements.length} agreement(s):</strong>
                  <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                    {selectedAgreements.map(id => {
                      const agreement = pendingAgreements.find(a => a._id === id);
                      return (
                        <li key={id}>
                          {agreement?.property?.title} - {agreement?.owner?.name} → {agreement?.tenant?.name} (₹{agreement?.monthlyRent?.toLocaleString()})
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'active-rent' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Active Rentals ({activeRentals.length})</h3>
            <button 
              className="btn btn-small btn-outline" 
              onClick={() => {
                console.log('Manual refresh triggered');
                loadData();
              }}
              disabled={loading}
              style={{ pointerEvents: 'auto', zIndex: 10 }}
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              Loading active rentals...
            </div>
          ) : activeRentals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p>No active rentals found.</p>
              <p>Active rentals appear here after agreements are approved.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Owner</th>
                  <th>Tenant</th>
                  <th>Monthly Rent</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Pending Payments</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeRentals.map((a) => (
                  <tr key={a._id}>
                    <td>{a.property?.title || 'N/A'}</td>
                    <td>
                      <div>
                        <strong>{a.owner?.name || 'N/A'}</strong>
                        <br />
                        <small style={{ color: '#6b7280' }}>{a.owner?.email || 'N/A'}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{a.tenant?.name || 'N/A'}</strong>
                        <br />
                        <small style={{ color: '#6b7280' }}>{a.tenant?.email || 'N/A'}</small>
                      </div>
                    </td>
                    <td>₹{a.monthlyRent?.toLocaleString()}</td>
                    <td>{new Date(a.startDate).toLocaleDateString()}</td>
                    <td>{new Date(a.endDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${(a.payments?.[0]?.count || 0) > 0 ? "badge-warning" : "badge-success"}`}>
                        {(a.payments?.[0]?.count || 0)} pending
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <MessagingSystem token={token} user={user} />
      )}
    </div>
  );
};

export default AdminDashboard;

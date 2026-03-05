import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { createAuthenticatedApi } from "../utils/api.js";
import MessagingSystem from "../components/MessagingSystem.jsx";
import MaintenanceSystem from "../components/MaintenanceSystem.jsx";

const TenantDashboard = () => {
  const { token, user, logout } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('agreements'); // 'agreements', 'payments', 'messages', 'maintenance'

  // Create authenticated API instance
  const api = createAuthenticatedApi(token);

  const loadData = async () => {
    const [agrRes, payRes, notRes] = await Promise.all([
      api.get("/api/tenant/agreements"),
      api.get("/api/tenant/payments"),
      api.get("/api/tenant/notifications"),
    ]);
    setAgreements(agrRes.data.agreements);
    setPayments(payRes.data.payments);
    setNotifications(notRes.data.notifications);
  };

  useEffect(() => {
    if (token) {
      loadData().catch(console.error);
    }
  }, [token]);

  const markPaid = async (id) => {
    await api.post(`/api/tenant/payments/${id}/mark-paid`);
    loadData();
  };

  const downloadPdf = (id) => {
    window.open(`/api/tenant/agreements/${id}/pdf`, "_blank");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Tenant Dashboard</h2>
          <p>{user?.name}</p>
        </div>
        <button className="btn btn-outline" onClick={logout} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          Logout
        </button>
      </header>

      {/* Tab Navigation */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
          {['agreements', 'payments', 'messages', 'maintenance'].map((tab) => (
            <button
              key={tab}
              className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab(tab)}
              style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'agreements' && (
        <div className="card">
          <h3>My Agreements</h3>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Owner</th>
                <th>Status</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {agreements.map((a) => (
                <tr key={a._id}>
                  <td>{a.property?.title}</td>
                  <td>{a.owner?.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        a.status === "active"
                          ? "badge-success"
                          : a.status === "pending_approval"
                          ? "badge-warning"
                          : a.status === "rejected"
                          ? "badge-danger"
                          : ""
                      }`}
                    >
                      {a.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    {a.pdfPath && (
                      <button
                        className="btn btn-small btn-outline"
                        onClick={() => downloadPdf(a._id)}
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
                      >
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="card">
          <h3>Payment History</h3>
          <table>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>₹{p.amount}</td>
                  <td>{new Date(p.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === "paid"
                          ? "badge-success"
                          : p.status === "pending"
                          ? "badge-warning"
                          : "badge-danger"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.status === "pending" && (
                      <button
                        className="btn btn-small"
                        onClick={() => markPaid(p._id)}
                        style={{ pointerEvents: 'auto', zIndex: 10 }}
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'messages' && (
        <MessagingSystem token={token} user={user} />
      )}

      {activeTab === 'maintenance' && (
        <MaintenanceSystem property={agreements[0]?.property} token={token} userRole="tenant" />
      )}
    </div>
  );
};

export default TenantDashboard;

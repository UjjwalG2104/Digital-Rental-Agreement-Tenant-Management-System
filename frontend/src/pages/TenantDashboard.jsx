import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const TenantDashboard = () => {
  const { token, user, logout } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

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

      <section className="grid-2">
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
                      <button className="btn btn-small" onClick={() => downloadPdf(a._id)} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
                        Download
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Notifications</h3>
          <ul className="list">
            {notifications.map((n) => (
              <li key={n._id}>{n.message}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card">
        <h3>Payment History & Dues</h3>
        <table>
          <thead>
            <tr>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Late Fee</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td>{new Date(p.dueDate).toLocaleDateString()}</td>
                <td>₹{p.amount}</td>
                <td>
                  <span
                    className={`badge ${
                      p.status === "paid"
                        ? "badge-success"
                        : p.status === "pending"
                        ? "badge-warning"
                        : p.status === "late"
                        ? "badge-danger"
                        : ""
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td>₹{p.lateFee}</td>
                <td>
                  {p.status === "pending" && (
                    <button className="btn btn-small" onClick={() => markPaid(p._id)} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default TenantDashboard;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const AdminDashboard = () => {
  const { token, user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingAgreements, setPendingAgreements] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

  const loadData = async () => {
    const [usersRes, pendingRes, analyticsRes] = await Promise.all([
      api.get("/api/admin/users"),
      api.get("/api/admin/agreements/pending"),
      api.get("/api/admin/analytics/overview"),
    ]);
    setUsers(usersRes.data.users);
    setPendingAgreements(pendingRes.data.agreements);
    setAnalytics(analyticsRes.data);
  };

  useEffect(() => {
    if (token) {
      loadData().catch(console.error);
    }
  }, [token]);

  const toggleUser = async (id) => {
    await api.patch(`/api/admin/users/${id}/toggle`);
    loadData();
  };

  const approve = async (id) => {
    await api.post(`/api/admin/agreements/${id}/approve`);
    loadData();
  };

  const reject = async (id) => {
    await api.post(`/api/admin/agreements/${id}/reject`);
    loadData();
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

      <section className="grid-2">
        <div className="card">
          <h3>Manage Users</h3>
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
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span
                      className={`badge ${
                        u.isActive ? "badge-success" : "badge-danger"
                      }`}
                    >
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-small" onClick={() => toggleUser(u._id)} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
                      {u.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Agreements Pending Approval</h3>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Owner</th>
                <th>Tenant</th>
                <th>Rent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAgreements.map((a) => (
                <tr key={a._id}>
                  <td>{a.property?.title}</td>
                  <td>{a.owner?.name}</td>
                  <td>{a.tenant?.name}</td>
                  <td>₹{a.monthlyRent}</td>
                  <td>
                    <button className="btn btn-small" onClick={() => approve(a._id)} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
                      Approve
                    </button>
                    <button className="btn btn-small btn-ghost" onClick={() => reject(a._id)} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;


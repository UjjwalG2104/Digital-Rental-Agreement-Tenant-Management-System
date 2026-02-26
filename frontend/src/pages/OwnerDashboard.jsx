import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const OwnerDashboard = () => {
  const { token, user, logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [summary, setSummary] = useState(null);
  const [propForm, setPropForm] = useState({
    title: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    monthlyRent: "",
    securityDeposit: "",
  });
  const [agreementForm, setAgreementForm] = useState({
    propertyId: "",
    tenantEmail: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    securityDeposit: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` },
  });

  const loadData = async () => {
    const [propsRes, agrRes, sumRes] = await Promise.all([
      api.get("/api/owner/properties"),
      api.get("/api/owner/agreements"),
      api.get("/api/owner/rent/summary"),
    ]);
    setProperties(propsRes.data.properties);
    setAgreements(agrRes.data.agreements);
    setSummary(sumRes.data);
  };

  useEffect(() => {
    if (token) {
      loadData().catch(console.error);
    }
  }, [token]);

  const handlePropChange = (e) => {
    const { name, value } = e.target;
    setPropForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAgreementChange = (e) => {
    const { name, value } = e.target;
    setAgreementForm(prev => ({ ...prev, [name]: value }));
  };

  const createProperty = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post("/api/owner/properties", {
        ...propForm,
        monthlyRent: Number(propForm.monthlyRent),
        securityDeposit: Number(propForm.securityDeposit || 0),
      });
      setPropForm({
        title: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        monthlyRent: "",
        securityDeposit: "",
      });
      setMessage("Property created.");
      loadData();
    } catch (err) {
      console.error("Create property error (frontend)", err);
      setError(err.response?.data?.message || "Failed to create property. Please try again.");
    }
  };

  const createAgreement = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await api.post("/api/owner/agreements", {
        ...agreementForm,
        monthlyRent: Number(agreementForm.monthlyRent),
        securityDeposit: Number(agreementForm.securityDeposit || 0),
      });
      setAgreementForm({
        propertyId: "",
        tenantEmail: "",
        startDate: "",
        endDate: "",
        monthlyRent: "",
        securityDeposit: "",
      });
      setMessage("Agreement created and pending admin approval.");
      loadData();
    } catch (err) {
      console.error("Create agreement error (frontend)", err);
      setError(err.response?.data?.message || "Failed to create agreement. Please try again.");
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Owner Dashboard</h2>
          <p>{user?.name}</p>
        </div>
        <button className="btn btn-outline" onClick={logout}>
          Logout
        </button>
      </header>

      {summary && (
        <section className="summary-grid">
          <div className="card">
            <h3>Total Expected</h3>
            <p>₹{summary.totalExpected}</p>
          </div>
          <div className="card">
            <h3>Total Received</h3>
            <p>₹{summary.totalReceived}</p>
          </div>
          <div className="card">
            <h3>Pending Dues</h3>
            <p>₹{summary.totalPending}</p>
          </div>
        </section>
      )}

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="grid-2">
        <section className="card">
          <h3>Add Property</h3>
          <p style={{ fontSize: "0.85rem", marginTop: 4, marginBottom: 12, color: "#9ca3af" }}>
            Fill these details to create a new property. All fields except security deposit are
            required.
          </p>
          <form className="form-grid" onSubmit={createProperty}>
            <label>
              Property title
              <input
                name="title"
                type="text"
                placeholder="e.g., 2BHK Flat near Station"
                value={propForm.title}
                onChange={handlePropChange}
                required
                style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
              />
            </label>
            <label>
              Full address
              <input
                name="address"
                type="text"
                placeholder="Building, street, area"
                value={propForm.address}
                onChange={handlePropChange}
                required
                style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
              />
            </label>
            <label>
              City
              <input
                name="city"
                type="text"
                placeholder="City"
                value={propForm.city}
                onChange={handlePropChange}
                required
                style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
              />
            </label>
            <label>
              State
              <input
                name="state"
                type="text"
                placeholder="State"
                value={propForm.state}
                onChange={handlePropChange}
                required
                style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
              />
            </label>
            <label>
              Pincode
              <input
                name="pincode"
                type="text"
                placeholder="Postal code"
                value={propForm.pincode}
                onChange={handlePropChange}
                required
                style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
              />
            </label>
            <label>
              Monthly rent (₹)
              <input
                name="monthlyRent"
                type="number"
                placeholder="e.g., 20000"
                value={propForm.monthlyRent}
                onChange={handlePropChange}
                required
                style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
              />
            </label>
            <label>
              Security deposit (₹)
              <input
                name="securityDeposit"
                type="number"
                placeholder="e.g., 50000"
                value={propForm.securityDeposit}
                onChange={handlePropChange}
                style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
              />
            </label>
            <button className="btn btn-primary" type="submit" style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
              Save Property
            </button>
          </form>
        </section>

        <section className="card">
          <h3>Generate Agreement</h3>
          <form className="form-grid" onSubmit={createAgreement}>
            <select
              name="propertyId"
              value={agreementForm.propertyId}
              onChange={handleAgreementChange}
              required
              style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
            >
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title}
                </option>
              ))}
            </select>
            <input
              name="tenantEmail"
              placeholder="Tenant email"
              value={agreementForm.tenantEmail}
              onChange={handleAgreementChange}
              required
              style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
            />
            <label>
              Start date
              <input
                name="startDate"
                type="date"
                value={agreementForm.startDate}
                onChange={handleAgreementChange}
                required
                style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
              />
            </label>
            <label>
              End date
              <input
                name="endDate"
                type="date"
                value={agreementForm.endDate}
                onChange={handleAgreementChange}
                required
                style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
              />
            </label>
            <input
              name="monthlyRent"
              placeholder="Monthly Rent"
              type="number"
              value={agreementForm.monthlyRent}
              onChange={handleAgreementChange}
              required
              style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
            />
            <input
              name="securityDeposit"
              placeholder="Security Deposit"
              type="number"
              value={agreementForm.securityDeposit}
              onChange={handleAgreementChange}
              style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
            />
            <button className="btn btn-primary" type="submit" style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
              Create Agreement
            </button>
          </form>
        </section>
      </div>

      <section className="grid-2">
        <div className="card">
          <h3>My Properties</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>City</th>
                <th>Monthly Rent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.city}</td>
                  <td>₹{p.monthlyRent}</td>
                  <td>
                    <button
                      className="btn btn-small btn-ghost"
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("Remove this property?")) return;
                        setMessage("");
                        setError("");
                        try {
                          await api.delete(`/api/owner/properties/${p._id}`);
                          setMessage("Property deleted.");
                          loadData();
                        } catch (err) {
                          console.error("Delete property error (frontend)", err);
                          setError(
                            err.response?.data?.message || "Failed to delete property. Please try again."
                          );
                        }
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Agreements</h3>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Status</th>
                <th>Rent</th>
              </tr>
            </thead>
            <tbody>
              {agreements.map((a) => (
                <tr key={a._id}>
                  <td>{a.property?.title}</td>
                  <td>{a.tenant?.name}</td>
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
                  <td>₹{a.monthlyRent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default OwnerDashboard;


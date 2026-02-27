import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import PropertySearch from "../components/PropertySearch.jsx";
import ImageGallery from "../components/ImageGallery.jsx";
import NotificationCenter from "../components/NotificationCenter.jsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard.jsx";
import AvailabilityCalendar from "../components/AvailabilityCalendar.jsx";
import MessagingSystem from "../components/MessagingSystem.jsx";
import MaintenanceSystem from "../components/MaintenanceSystem.jsx";
import TenantScreening from "../components/TenantScreening.jsx";

const OwnerDashboard = () => {
  const { token, user, logout } = useAuth();
  const [properties, setProperties] = useState([]);
  const [searchResults, setSearchResults] = useState({ properties: [], pagination: {} });
  const [isSearchMode, setIsSearchMode] = useState(false);
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

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearchMode(true);
  };

  const clearSearch = () => {
    setIsSearchMode(false);
    setSearchResults({ properties: [], pagination: {} });
  };

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'analytics', 'properties', 'agreements', 'calendar', 'messages', 'maintenance', 'screening'

  const handleImageUpdate = (updatedProperty) => {
    // Update properties list
    setProperties(prev => prev.map(p => p._id === updatedProperty._id ? updatedProperty : p));
    // Update search results if in search mode
    if (isSearchMode) {
      setSearchResults(prev => ({
        ...prev,
        properties: prev.properties.map(p => p._id === updatedProperty._id ? updatedProperty : p)
      }));
    }
  };

  const openGallery = (property) => {
    setSelectedProperty(property);
    setShowGallery(true);
  };

  const closeGallery = () => {
    setSelectedProperty(null);
    setShowGallery(false);
  };

  const displayProperties = isSearchMode ? searchResults.properties : properties;

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
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <NotificationCenter token={token} user={user} />
          <button className="btn btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
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

      {/* Tab Navigation */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
          {['overview', 'analytics', 'properties', 'agreements', 'calendar', 'messages', 'maintenance', 'screening'].map((tab) => (
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
      {activeTab === 'overview' && (
        <>
          <PropertySearch onSearchResults={handleSearchResults} token={token} />
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
      </>
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard token={token} />
      )}

      {activeTab === 'properties' && (
        <>
          <PropertySearch onSearchResults={handleSearchResults} token={token} />
          <div className="card">
            <h3>My Properties</h3>
            {isSearchMode && (
              <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, color: '#6b7280' }}>
                  Found {searchResults.pagination.totalProperties || 0} properties
                </p>
                <button 
                  className="btn btn-small btn-outline"
                  onClick={clearSearch}
                  style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
                >
                  Clear Search
                </button>
              </div>
            )}
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
                {displayProperties.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.city}</td>
                    <td>₹{p.monthlyRent}</td>
                    <td>
                      <button
                        className="btn btn-small btn-ghost"
                        type="button"
                        onClick={() => openGallery(p)}
                        style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative', marginRight: '0.5rem' }}
                      >
                        📷 Images
                      </button>
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
                        style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'agreements' && (
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
      )}

      {activeTab === 'calendar' && (
        <AvailabilityCalendar property={properties[0]} token={token} />
      )}

      {activeTab === 'messages' && (
        <MessagingSystem token={token} user={user} />
      )}

      {activeTab === 'maintenance' && (
        <MaintenanceSystem property={properties[0]} token={token} userRole="owner" />
      )}

      {activeTab === 'screening' && (
        <TenantScreening token={token} property={properties[0]} />
      )}

      {/* Image Gallery Modal */}
      {showGallery && selectedProperty && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={closeGallery}
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
              onClick={closeGallery}
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
            <ImageGallery
              property={selectedProperty}
              token={token}
              onImageUpdate={handleImageUpdate}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;


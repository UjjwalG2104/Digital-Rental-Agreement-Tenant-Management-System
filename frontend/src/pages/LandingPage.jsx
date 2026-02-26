import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="layout">
      <header className="navbar">
        <div className="logo">RentFlow</div>
        <nav>
          <Link to="/login" className="btn btn-ghost">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="hero">
        <section className="hero-content">
          <h1>Digital Rental Agreement & Tenant Management</h1>
          <p>
            Manage properties, tenants, rent payments, and rental agreements in one modern, secure
            platform.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              For Owners
            </Link>
            <Link to="/register" className="btn btn-outline">
              For Tenants
            </Link>
          </div>

          <div className="feature-grid">
            <div className="card">
              <h3>Auto Agreements</h3>
              <p>Generate professional rental agreements with one click and download as PDF.</p>
            </div>
            <div className="card">
              <h3>Rent Tracking</h3>
              <p>Track monthly payments, dues, and late fees in real time.</p>
            </div>
            <div className="card">
              <h3>Smart Reminders</h3>
              <p>Notify tenants on upcoming rent and agreement expiry dates.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;


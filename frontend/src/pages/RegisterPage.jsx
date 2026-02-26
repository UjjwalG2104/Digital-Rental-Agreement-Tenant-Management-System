import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "owner",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", form);
      login(res.data);
      const role = res.data.user.role;
      if (role === "owner") navigate("/owner");
      else if (role === "tenant") navigate("/tenant");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        {error && <div className="alert error">{error}</div>}
        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} required style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }} />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }} />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
          />
        </label>
        <label>
          I am a
          <select name="role" value={form.role} onChange={handleChange} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
            <option value="owner">Property Owner</option>
            <option value="tenant">Tenant</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}>
          {loading ? "Creating account..." : "Sign up"}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;


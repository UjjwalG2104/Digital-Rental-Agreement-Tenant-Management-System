import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticsDashboard = ({ token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/owner/analytics?range=${timeRange}`);
      setAnalytics(response.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token, timeRange]);

  if (loading) {
    return (
      <div className="card">
        <h3>Analytics Dashboard</h3>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="card">
        <h3>Analytics Dashboard</h3>
        <div style={{ textAlign: 'center', padding: '2rem' }}>No analytics data available</div>
      </div>
    );
  }

  // Simple bar chart component
  const SimpleBarChart = ({ data, title, valueKey, labelKey, color }) => {
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    return (
      <div className="card">
        <h4>{title}</h4>
        <div style={{ marginTop: '1rem' }}>
          {data.map((item, index) => (
            <div key={index} style={{ marginBottom: '0.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.25rem',
                fontSize: '0.9rem'
              }}>
                <span>{item[labelKey]}</span>
                <span style={{ fontWeight: 'bold' }}>{item[valueKey]}</span>
              </div>
              <div style={{ 
                height: '20px', 
                background: '#f3f4f6', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(item[valueKey] / maxValue) * 100}%`,
                    background: color,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple line chart component
  const SimpleLineChart = ({ data, title, valueKey, labelKey, color }) => {
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (item[valueKey] / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="card">
        <h4>{title}</h4>
        <div style={{ marginTop: '1rem', height: '200px', position: 'relative' }}>
          <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            
            {/* Data line */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
            />
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - (item[valueKey] / maxValue) * 100;
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill={color}
                />
              );
            })}
          </svg>
          
          {/* Labels */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '0.5rem',
            fontSize: '0.8rem',
            color: '#6b7280'
          }}>
            {data.map((item, index) => (
              <span key={index}>{item[labelKey]}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Time Range Selector */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Analytics Dashboard</h3>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="card">
          <h4>Total Revenue</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            ₹{analytics.totalRevenue?.toLocaleString() || 0}
          </p>
        </div>
        <div className="card">
          <h4>Active Properties</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {analytics.activeProperties || 0}
          </p>
        </div>
        <div className="card">
          <h4>Occupancy Rate</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {analytics.occupancyRate?.toFixed(1) || 0}%
          </p>
        </div>
        <div className="card">
          <h4>Pending Payments</h4>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
            ₹{analytics.pendingPayments?.toLocaleString() || 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        {analytics.revenueByMonth && (
          <SimpleLineChart
            data={analytics.revenueByMonth}
            title="Revenue Trend"
            valueKey="revenue"
            labelKey="month"
            color="#10b981"
          />
        )}
        
        {analytics.topProperties && (
          <SimpleBarChart
            data={analytics.topProperties}
            title="Top Performing Properties"
            valueKey="revenue"
            labelKey="title"
            color="#3b82f6"
          />
        )}
        
        {analytics.paymentsByStatus && (
          <SimpleBarChart
            data={analytics.paymentsByStatus}
            title="Payments by Status"
            valueKey="count"
            labelKey="status"
            color="#f59e0b"
          />
        )}
        
        {analytics.newTenantsByMonth && (
          <SimpleLineChart
            data={analytics.newTenantsByMonth}
            title="New Tenants Trend"
            valueKey="count"
            labelKey="month"
            color="#8b5cf6"
          />
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PropertySearch = ({ onSearchResults, token }) => {
  const [searchForm, setSearchForm] = useState({
    query: '',
    city: '',
    state: '',
    minRent: '',
    maxRent: '',
    sortBy: 'newest'
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  const handleSearch = async (page = 1) => {
    setLoading(true);
    try {
      const params = { ...searchForm, page };
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await api.get('/api/owner/properties/search', { params });
      onSearchResults(response.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleReset = () => {
    setSearchForm({
      query: '',
      city: '',
      state: '',
      minRent: '',
      maxRent: '',
      sortBy: 'newest'
    });
    onSearchResults({ properties: [], pagination: {} });
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Search Properties</h3>
        <button 
          className="btn btn-small btn-outline"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
        >
          {isExpanded ? '▲' : '▼'} Advanced Search
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            name="query"
            placeholder="Search by title, address..."
            value={searchForm.query}
            onChange={handleInputChange}
            style={{ 
              flex: 1, 
              pointerEvents: 'auto', 
              userSelect: 'text', 
              zIndex: 10, 
              position: 'relative' 
            }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
            style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button 
            type="button"
            onClick={handleReset}
            className="btn btn-outline"
            style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
          >
            Reset
          </button>
        </div>

        {isExpanded && (
          <div className="form-grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={searchForm.city}
              onChange={handleInputChange}
              style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={searchForm.state}
              onChange={handleInputChange}
              style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
            />
            <input
              type="number"
              name="minRent"
              placeholder="Min Rent (₹)"
              value={searchForm.minRent}
              onChange={handleInputChange}
              style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
            />
            <input
              type="number"
              name="maxRent"
              placeholder="Max Rent (₹)"
              value={searchForm.maxRent}
              onChange={handleInputChange}
              style={{ pointerEvents: 'auto', userSelect: 'text', zIndex: 10, position: 'relative' }}
            />
            <select
              name="sortBy"
              value={searchForm.sortBy}
              onChange={handleInputChange}
              style={{ pointerEvents: 'auto', zIndex: 10, position: 'relative' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rent-low">Rent: Low to High</option>
              <option value="rent-high">Rent: High to Low</option>
            </select>
          </div>
        )}
      </form>
    </div>
  );
};

export default PropertySearch;

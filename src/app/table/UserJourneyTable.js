'use client';
import React, { useState, useEffect } from 'react';

function UserJourneyTable() {
  const [sessionId, setSessionId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!sessionId) {
      setError('Please enter a session ID.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/user-journey?session_id=${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setResults(data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
    } catch (error) {
      setError('Error fetching data. Please try again.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>User Journey Table</h2>
      <input 
        type="text" 
        placeholder="Enter Session ID" 
        value={sessionId} 
        onChange={(e) => setSessionId(e.target.value)} 
      />
      <button onClick={fetchData} disabled={loading}>
        {loading ? 'Loading...' : 'Query Database'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Event Type</th>
            <th>Page</th>
          </tr>
        </thead>
        <tbody>
          {results.length > 0 ? (
            results.map((event, index) => (
              <tr key={index}>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>{event.eventType}</td>
                <td>{event.page}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>No data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default UserJourneyTable;
'use client';
import React, { useState, useEffect } from 'react';

// Function to format the AWS timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return ""; // Handle cases where timestamp might be missing or null

  try {
      // Check if the timestamp is numeric (Unix epoch in seconds)
      const timestampNumber = Number(timestamp);
      if (!isNaN(timestampNumber)) {
          const date = new Date(timestampNumber * 1000); // Multiply by 1000 for milliseconds

          // Options for toLocaleString (customize as needed)
          const options = { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: 'numeric', 
              second: 'numeric',
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Use user's timezone
          };

          return date.toLocaleString(undefined, options);  // Or a specific locale like 'en-US'
      } else {
        //It's not a number, so it's probably already in a date format
        const date = new Date(timestamp);
        return date.toLocaleString();
      }
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Invalid Date"; // Or a suitable error message
  }
}

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
      const response = await fetch(`https://kyoh9ri6zj.execute-api.us-east-1.amazonaws.com/dev/analytics?session_id=${sessionId}`);
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
                <td>{formatTimestamp(event.timestamp)}</td>
                <td>{event.event_type}</td>
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
'use client';
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";

// Function to format AWS timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return "N/A"; 
  try {
    const timestampNumber = Number(timestamp);
    if (!isNaN(timestampNumber)) {
      return new Date(timestampNumber * 1000).toLocaleString(undefined, { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    }
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Invalid Date";
  }
}

export default function UserActivityTable() {
  const [userId, setUserId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const fetchUserData = async () => {
    if (!userId.trim()) {
      setError('User ID cannot be empty.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `https://your-api-endpoint.com/user-activities?user_id=${encodeURIComponent(userId)}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch user data');
      const data = await response.json();
      
      // Sort by timestamp descending (newest first)
      setResults(data.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      setError('Error fetching user data. Please try again.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity Explorer</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-64"
            />
            <Button 
              onClick={fetchUserData} 
              disabled={loading}
              variant="default"
            >
              {loading ? 'Loading...' : 'Search User'}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length > 0 ? (
                  results.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatTimestamp(event.timestamp)}</TableCell>
                      <TableCell>{event.activity}</TableCell>
                      <TableCell>{event.event_type}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {event.metadata}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      {loading ? 'Loading data...' : 'No user activity found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

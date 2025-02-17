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

export default function UserJourneyTable() {
  const [sessionId, setSessionId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  //const [error, setError] = useState<null | string>(() => null);


  const fetchData = async () => {
    if (!sessionId.trim()) {
      setError('Session ID cannot be empty.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`https://kyoh9ri6zj.execute-api.us-east-1.amazonaws.com/dev/analytics?session_id=${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setResults(data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    } catch (error) {
      setError('Error fetching data. Please try again.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
   <Card>

      <CardHeader>
        <CardTitle>User Journey Table</CardTitle>
        {/* <CardDescription>lorem ipsum</CardDescription> */}
      </CardHeader>

    <CardContent>
      <div>
          <div className="flex items-center gap-4 mb-4">
            <Input
              type="text"
              placeholder="Enter Session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-64 border-gray-300 dark:border-gray-700"
              />
            <Button onClick={fetchData} disabled={loading} variant="default">
              {loading ? 'Loading...' : 'Query Database'}
            </Button>
          </div>

          

          <div className="overflow-x-auto">
            <Table className="w-full border border-gray-200 dark:border-gray-700 rounded-md">
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="w-1/3 px-4 py-2 text-left text-gray-800 dark:text-gray-200">Timestamp</TableHead>
                  <TableHead className="w-1/3 px-4 py-2 text-left text-gray-800 dark:text-gray-200">Event Type</TableHead>
                  <TableHead className="w-1/3 px-4 py-2 text-left text-gray-800 dark:text-gray-200">Page</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length > 0 ? (
                  results.map((event, index) => (
                    <TableRow key={index} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                      <TableCell className="px-4 py-2">{formatTimestamp(event.timestamp)}</TableCell>
                      <TableCell className="px-4 py-2">{event.event_type}</TableCell>
                      <TableCell className="px-4 py-2">{event.page}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                      No data available
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

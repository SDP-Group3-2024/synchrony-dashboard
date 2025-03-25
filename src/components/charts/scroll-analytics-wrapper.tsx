'use client';

import React, { useState, useEffect } from 'react';
import { ScrollAnalytics } from './scroll-analytics';
import { Button } from '../ui/button';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

// Define scroll event interface
interface ScrollEvent {
  _id: string;
  event_type: string;
  session_id: string;
  timestamp: number;
  page_url: string;
  page_path: string;
  page_title: string;
  scroll_depth: number;
  scroll_direction: string;
  viewport_height: number;
  document_height: number;
  event_id: string;
  user_ip: string;
  user_agent: string;
}

interface ScrollAnalyticsWrapperProps {
  initialData: ScrollEvent[];
}

const ScrollAnalyticsWrapper: React.FC<ScrollAnalyticsWrapperProps> = ({ initialData }) => {
  const [data, setData] = useState<ScrollEvent[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pageFilter, setPageFilter] = useState<string>('all');

  // Set up date range selection
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 7);

  const defaultEndDate = new Date();

  const [dateRange, setDateRange] = useState([
    {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      key: 'selection',
    },
  ]);

  // Get unique page titles for the filter or use sample page titles if initialData is empty
  const uniquePages =
    initialData && initialData.length > 0
      ? Array.from(new Set(initialData.map((item) => item.page_title)))
      : ['Home Page', 'About Us', 'Products', 'Blog', 'Contact Us'];

  // Handle date range selection
  const handleDateRangeChange = (ranges: any) => {
    setDateRange([ranges.selection]);
  };

  // Fetch data based on filters
  const fetchFilteredData = async () => {
    if (!dateRange[0].startDate || !dateRange[0].endDate) return;

    setIsLoading(true);

    try {
      const startDate = format(dateRange[0].startDate, 'yyyy-MM-dd');
      const endDate = format(dateRange[0].endDate, 'yyyy-MM-dd');

      let url = `/api/scroll-data?startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      let fetchedData = await response.json();

      // Apply page filter if needed
      if (pageFilter !== 'all') {
        fetchedData = fetchedData.filter(
          (event: ScrollEvent) => event.page_title === pageFilter,
        );
      }

      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching scroll data:', error);
    } finally {
      setIsLoading(false);
      setShowDatePicker(false);
    }
  };

  // Apply filters when changing page filter and provide sample data if none exists
  useEffect(() => {
    if (!initialData || initialData.length === 0) {
      // Provide sample data if no data is available
      const sampleData: ScrollEvent[] = Array.from({ length: 20 }).map((_, i) => ({
        _id: `sample-${i}`,
        event_type: 'scroll',
        session_id: `session-${i % 5}`,
        timestamp: Math.floor(Date.now() / 1000) - i * 3600,
        page_url: `http://example.com/${
          ['home', 'about', 'products', 'blog', 'contact'][i % 5]
        }`,
        page_path: `/${['home', 'about', 'products', 'blog', 'contact'][i % 5]}`,
        page_title: ['Home Page', 'About Us', 'Products', 'Blog', 'Contact Us'][i % 5],
        scroll_depth: Math.floor(Math.random() * 100),
        scroll_direction: i % 3 === 0 ? 'up' : 'down',
        viewport_height: 700 + Math.floor(Math.random() * 300),
        document_height: 1500 + Math.floor(Math.random() * 500),
        event_id: `event-${i}`,
        user_ip: '127.0.0.1',
        user_agent: 'Mozilla/5.0',
      }));

      setData(sampleData);
    } else if (pageFilter === 'all') {
      setData(initialData);
    } else {
      setData(initialData.filter((event) => event.page_title === pageFilter));
    }
  }, [pageFilter, initialData]);

  return (
    <div className="space-y-4">
      {/* Filters section */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex gap-2 items-center"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>
                {format(dateRange[0].startDate, 'MMM d, yyyy')} -{' '}
                {format(dateRange[0].endDate, 'MMM d, yyyy')}
              </span>
            </Button>

            {showDatePicker && (
              <div className="absolute z-10 mt-1 bg-background border rounded-md shadow-lg">
                <DateRange
                  ranges={dateRange}
                  onChange={handleDateRangeChange}
                  months={1}
                  direction="horizontal"
                  editableDateInputs={true}
                  showSelectionPreview={true}
                  moveRangeOnFirstSelection={false}
                />
                <div className="p-2 border-t flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={fetchFilteredData}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Select
            value={pageFilter}
            onValueChange={setPageFilter}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pages</SelectItem>
              {uniquePages.map((page) => (
                <SelectItem
                  key={page}
                  value={page}
                >
                  {page}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Button
            onClick={fetchFilteredData}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Update Data'}
          </Button>
        </div>
      </div>

      {/* Analytics dashboard */}
      <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
        <ScrollAnalytics initialData={data} />
      </div>
    </div>
  );
};

export default ScrollAnalyticsWrapper;

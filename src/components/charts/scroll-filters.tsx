'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useRouter } from 'next/navigation';

interface ScrollFiltersProps {
  initialDateRange?: {
    startDate: string;
    endDate: string;
  };
  pagePath: string;
  uniquePages: string[];
}

export function ScrollFilters({
  initialDateRange,
  pagePath,
  uniquePages,
}: ScrollFiltersProps) {
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pageFilter, setPageFilter] = useState<string>(pagePath);

  // Set up date range selection
  const defaultStartDate = initialDateRange
    ? new Date(initialDateRange.startDate)
    : new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 7);

  const defaultEndDate = initialDateRange ? new Date(initialDateRange.endDate) : new Date();

  const [dateRange, setDateRange] = useState([
    {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      key: 'selection',
    },
  ]);

  // Handle date range selection
  const handleDateRangeChange = (ranges: any) => {
    setDateRange([ranges.selection]);
  };

  // Handle filter changes
  const handleFilterChange = (newPageFilter: string) => {
    setPageFilter(newPageFilter);
    updateUrl(newPageFilter, dateRange[0].startDate, dateRange[0].endDate);
  };

  // Update URL with new filters
  const updateUrl = (page: string, startDate: Date, endDate: Date) => {
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    const newPath = `/page-analytics/${page}/${startDateStr}/${endDateStr}`;
    console.log('newPath', newPath);

    router.push(newPath);
  };

  // Handle date range apply
  const handleApplyDateRange = () => {
    updateUrl(pageFilter, dateRange[0].startDate, dateRange[0].endDate);
    setShowDatePicker(false);
  };

  return (
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
                  onClick={handleApplyDateRange}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>

        <Select
          value={pageFilter}
          onValueChange={handleFilterChange}
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
    </div>
  );
}

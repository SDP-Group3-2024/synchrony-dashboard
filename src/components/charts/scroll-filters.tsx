'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ScrollFiltersProps {
  pagePaths?: string[];
  initialDateRange: {
    startDate: string;
    endDate: string;
  };
  pagePath: string;
}

export function ScrollFilters({
  pagePaths = [],
  initialDateRange,
  pagePath,
}: ScrollFiltersProps) {
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Set default dates from props
  const defaultStartDate = new Date(initialDateRange.startDate);
  const defaultEndDate = new Date(initialDateRange.endDate);

  // Initialize date range state
  const [dateRange, setDateRange] = useState([
    {
      startDate: defaultStartDate,
      endDate: defaultEndDate,
      key: 'selection',
    },
  ]);

  // Handle date range selection
  const handleDateRangeChange = (ranges: RangeKeyDict) => {
    if (ranges.selection?.startDate && ranges.selection?.endDate) {
      setDateRange([
        {
          startDate: ranges.selection.startDate,
          endDate: ranges.selection.endDate,
          key: 'selection',
        },
      ]);
    }
  };

  // Update URL with new filters
  const updateUrl = (
    page: string,
    startDate: Date | undefined,
    endDate: Date | undefined,
  ) => {
    if (!startDate || !endDate) return;

    // if the page path is / convert it to %20root
    if (page === '/') {
      page = '_root';
    }
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    const newPath = `/page-analytics/${page}/${startDateStr}/${endDateStr}`;
    router.push(newPath);
  };

  // Handle date range apply
  const handleApplyDateRange = () => {
    if (!dateRange[0]?.startDate || !dateRange[0]?.endDate) return;
    updateUrl('', dateRange[0].startDate, dateRange[0].endDate);
    setShowDatePicker(false);
  };

  // Handle page path change
  const handlePagePathChange = (value: string) => {
    if (!dateRange[0]?.startDate || !dateRange[0]?.endDate) return;
    updateUrl(value, dateRange[0].startDate, dateRange[0].endDate);
  };

  // Ensure we have valid dates before rendering
  if (!dateRange[0]?.startDate || !dateRange[0]?.endDate) {
    return null;
  }

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

        {pagePaths && pagePaths.length > 0 && (
          <Select
            value={pagePath}
            onValueChange={handlePagePathChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={pagePath === '_root' ? '/' : pagePath} />
            </SelectTrigger>
            <SelectContent>
              {pagePaths.map((path) => (
                <SelectItem
                  key={path}
                  value={path}
                >
                  {path === '_root' ? '/' : path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}

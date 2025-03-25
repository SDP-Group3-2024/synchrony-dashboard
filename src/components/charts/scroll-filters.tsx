'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { DateRange, RangeKeyDict } from 'react-date-range';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { Input } from '../ui/input';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function ScrollFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Extract page path from URL, removing date portions
  const fullPath = pathname.split('/').slice(2).join('/') || '';
  const pagePath = fullPath.split('/')[0] || '';

  // Extract date range from URL or use defaults
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');

  const defaultStartDate = startDateParam
    ? new Date(startDateParam)
    : (() => {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        return date;
      })();

  const defaultEndDate = endDateParam ? new Date(endDateParam) : new Date();

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

  // Handle filter changes
  const handleFilterChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPageFilter = formData.get('pageFilter') as string;
    updateUrl(newPageFilter, dateRange[0].startDate, dateRange[0].endDate);
  };

  // Update URL with new filters
  const updateUrl = (page: string, startDate: Date, endDate: Date) => {
    // if the page path is / convert it to %20root
    if (page === '/') {
      page = '%20root';
    }
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    const newPath = `/page-analytics/${page}/${startDateStr}/${endDateStr}`;
    router.push(newPath);
  };

  // Handle date range apply
  const handleApplyDateRange = () => {
    updateUrl(pagePath, dateRange[0].startDate, dateRange[0].endDate);
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

        <form
          onSubmit={handleFilterChange}
          className="flex gap-2"
        >
          <Input
            name="pageFilter"
            defaultValue={pagePath}
            placeholder="Enter page path"
            className="w-[200px]"
          />
          <Button type="submit">Go</Button>
        </form>
      </div>
    </div>
  );
}

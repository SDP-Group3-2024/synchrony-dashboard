"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { SankeyChartProps } from "@/app/lib/types";
import { ResponsiveSankey } from "@nivo/sankey";
import {
  DateRange,
  DateRangePickerProps,
  RangeKeyDict,
} from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import { ChartConfig, ChartContainer } from "../ui/chart";
import { Button } from "../ui/button";
import { CalendarIcon, Loader2 } from "lucide-react";

interface SankeyClientWrapperProps {
  initialDateRange: DateRangePickerProps["ranges"];
  initialData: SankeyChartProps;
}

const SankeyClientWrapper: React.FC<SankeyClientWrapperProps> = ({
  initialDateRange,
  initialData,
}) => {
  const [sankeyData, setSankeyData] = useState<SankeyChartProps>(initialData);
  const [dateRange, setDateRange] =
    useState<DateRangePickerProps["ranges"]>(initialDateRange);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const chartConfig: ChartConfig = {
    sankey: {
      label: "Sankey Flow",
      color: "hsl(var(--chart-1))",
    },
  };
  
  // Close datepicker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click was on a date range picker element - don't close if it was
      const isDatePickerClick = (event.target as HTMLElement).closest('.rdrDateRangeWrapper') ||
                               (event.target as HTMLElement).closest('.rdrDefinedRangesWrapper');
      
      if (
        datePickerRef.current && 
        buttonRef.current && 
        !datePickerRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node) &&
        !isDatePickerClick
      ) {
        setShowDatePicker(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const fetchData = useCallback(
    async (ranges: DateRangePickerProps["ranges"]) => {
      setIsLoading(true);
      if (!ranges || !ranges[0].startDate || !ranges[0].endDate) return;

      const startDate = format(ranges[0].startDate, "yyyy-MM-dd");
      const endDate = format(ranges[0].endDate, "yyyy-MM-dd");
      try {
        const response = await fetch(
          `/api/sankey-data?startDate=${startDate}&endDate=${endDate}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data: SankeyChartProps = await response.json();
        setSankeyData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const handleDateChange = async (range: RangeKeyDict) => {
    const { startDate, endDate } = range["range1"];
    if (!startDate || !endDate) return;
    setDateRange([{ startDate, endDate }]);
    
    // Don't close the datepicker on selection, let user manually close it
    // Only fetch data if both dates are selected and different from current
    if (startDate && endDate && 
        dateRange[0].startDate?.getTime() !== startDate.getTime() && 
        dateRange[0].endDate?.getTime() !== endDate.getTime()) {
      await fetchData([{ startDate, endDate }]);
    }
  };

  const handleShowDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  // Format the date range for display
  const formatDateRange = () => {
    if (dateRange && dateRange[0] && dateRange[0].startDate && dateRange[0].endDate) {
      return `${format(dateRange[0].startDate, "MMM d, yyyy")} - ${format(dateRange[0].endDate, "MMM d, yyyy")}`;
    }
    return "Select date range";
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {formatDateRange()}
        </div>
        <Button 
          ref={buttonRef}
          onClick={handleShowDatePicker}
          variant="outline" 
          size="sm" 
          className="gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          {showDatePicker ? "Hide Calendar" : "Filter by Date"}
        </Button>
      </div>
      
      {showDatePicker && (
        <div 
          ref={datePickerRef}
          className="absolute right-0 z-10 bg-background border rounded-md shadow-lg"
          style={{ width: "auto" }}
        >
          <DateRange
            ranges={dateRange}
            onChange={(selection) => handleDateChange(selection)}
            maxDate={new Date()}
            editableDateInputs={true}
            months={1}
            direction="horizontal"
            className="border-0"
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
              onClick={() => {
                if (dateRange && dateRange[0] && dateRange[0].startDate && dateRange[0].endDate) {
                  fetchData(dateRange);
                  setShowDatePicker(false);
                }
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      )}
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <ChartContainer config={chartConfig}>
          <ResponsiveSankey
            data={sankeyData}
            margin={{ top: 40, right: 120, bottom: 80, left: 120 }}
            align="justify"
            colors={["#2a9d90", "#274754", "#f4a462", "#e8c468", "e76e50"]}
            nodeOpacity={1}
            nodeThickness={18}
            nodeBorderWidth={1}
            nodeBorderColor={{ from: "color", modifiers: [["darker", 0.8]] }}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            labelPosition="outside"
            labelOrientation="horizontal"
            labelPadding={16}
            labelTextColor={{ from: "color", modifiers: [["darker", 1.2]] }}
          />
        </ChartContainer>
      </div>
    </div>
  );
};

export default SankeyClientWrapper;

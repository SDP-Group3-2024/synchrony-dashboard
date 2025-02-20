"use client";

import React, { useState, useCallback } from "react";
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
  const chartConfig: ChartConfig = {
    sankey: {
      label: "Sankey Flow",
      color: "hsl(var(--chart-1))",
    },
  };
  console.log("initialDateRange", initialDateRange);
  const fetchData = useCallback(
    async (ranges: DateRangePickerProps["ranges"]) => {
      setIsLoading(true);
      if (!ranges || !ranges[0].startDate || !ranges[0].endDate) return;

      const startDate = format(ranges[0].startDate, "yyyy-MM-dd");
      const endDate = format(ranges[0].endDate, "yyyy-MM-dd");
      console.log(startDate, endDate);
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

    await fetchData(dateRange);
  };

  return (
    <div className={`${isLoading ? "opacity-50" : ""}`}>
      <DateRange
        ranges={dateRange}
        onChange={(e: RangeKeyDict) => handleDateChange(e)}
        maxDate={new Date()}
      />
      <ChartContainer config={chartConfig}>
        <ResponsiveSankey
          data={sankeyData}
          margin={{ top: 80, right: 120, bottom: 80, left: 120 }}
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
  );
};

export default SankeyClientWrapper;

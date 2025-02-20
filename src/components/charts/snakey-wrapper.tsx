"use client";

import React from "react";
import { SankeyChartProps } from "@/app/api/types";
import { ResponsiveSankey } from "@nivo/sankey";

interface SankeyClientWrapperProps {
  data: SankeyChartProps;
}

const SankeyClientWrapper: React.FC<SankeyClientWrapperProps> = ({ data }) => {
  return (
    <ResponsiveSankey
      data={data}
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
  );
};

export default SankeyClientWrapper;

export interface PageExitEvent {
  event_id: string;
  page: string;
  url: string;
  session_id: string;
  timestamp: number;
}

export interface SankeyChartProps {
  nodes: { id: string }[];
  links: { source: string; target: string; value: number }[];
}

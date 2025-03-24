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

export interface ScrollEvent {
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

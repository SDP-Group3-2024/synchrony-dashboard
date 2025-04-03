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
export type EventType =
  | "page_exit"
  | "click"
  | "scroll"
  | "performance"
  | "error"
  | "activity";
export interface BaseEventData {
  event_type: EventType;
  timestamp: string;
  session_id: string;
  page_url: string;
  page_path: string;
  page_title: string;
}
export interface PerformanceEventData extends BaseEventData {
  event_type: "performance";
  load_time: number;
  dom_interactive_time: number;
  dom_complete_time: number;
  first_contentful_paint?: number;
  largest_contentful_paint?: number;
  first_input_delay?: number;
  cumulative_layout_shift?: number;
}
export interface ClickEvent extends BaseEventData {
  event_type: "click";
  element_tag: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  x_position: number;
  y_position: number;
  analytics_id?: string;
  category?: string;
  action?: string;
}

export interface ScrollEvent extends BaseEventData {
  event_type: "scroll";
  scroll_depth: number;
  scroll_direction: "up" | "down";
  viewport_height: number;
  document_height: number;
}

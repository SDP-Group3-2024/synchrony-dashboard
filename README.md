<p align="center">
  <img src="synchrony-logo-tm.jpg">
</p>

<h1 style="background-color:#000E2F; color:white; padding:4px;">Synchrony Analytics Dashboard</h1>

A web analytics dashboard built with Next.js that visualizes user interactions and performance metrics collected from websites. Built for Synchrony, by the UConn College of Engineering.

<p align="center">
  <img src="UConn_COE_Logo.jpg">
</p>

<h2 style="background-color:#000E2F; color:white; padding:4px;">Quick Start</h2>

1. Clone the repository
2. Install dependencies: `npm i` (you may need to use `npm i --force` due to Next.js version compatibility issues)
3. Create a `.env.local` file with your MongoDB connection details:
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=your_database_name
   ```
4. Run the development server: `npm run dev`
5. Access the dashboard at `http://localhost:3000`

<h2 style="background-color:#000E2F; color:white; padding:4px;">Features</h2>

- **Page Analytics**: Detailed insights for specific pages including:
  - Scroll depth and behavior
  - Click tracking with heatmaps
  - Performance metrics (load time, FCP, LCP, etc.)
  - Visitor counts
- **Sankey Flow Visualization**: User journey visualization across pages
- **Scroll Analytics**: Scrolling behavior across the site
- **Date Range Filtering**: Analyze data within specific time periods

<h2 style="background-color:#000E2F; color:white; padding:4px;">Technology Stack</h2>

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Components**: Shadcn/UI and Tailwind CSS
- **Charting Libraries**: Recharts and Nivo
- **Database**: MongoDB
- **Typescript**: For type safety and better developer experience

<h2 style="background-color:#000E2F; color:white; padding:4px;">Data Structure</h2>

### MongoDB Collections

The application uses the following MongoDB collections:

- `ClickEvents`: Stores user click interactions
- `ScrollEvents`: Stores user scrolling behavior
- `PerformanceEvents`: Stores page performance metrics
- `PageEvents`: Stores page navigation events
- `SankeyData`: Stores pre-processed user flow data for Sankey diagrams

### Event Data Model

All events share a common base structure:

```typescript
interface BaseEventData {
  event_type: "page_exit" | "click" | "scroll" | "performance" | "error" | "activity";
  timestamp: string;
  session_id: string;
  page_url: string;
  page_path: string;
  page_title: string;
}
```

Specific event types extend this base interface with additional properties:

#### Click Events
```typescript
interface ClickEvent extends BaseEventData {
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
```

#### Scroll Events
```typescript
interface ScrollEvent extends BaseEventData {
  event_type: "scroll";
  scroll_depth: number;
  scroll_direction: "up" | "down";
  viewport_height: number;
  document_height: number;
}
```

#### Performance Events
```typescript
interface PerformanceEventData extends BaseEventData {
  event_type: "performance";
  load_time: number;
  dom_interactive_time: number;
  dom_complete_time: number;
  first_contentful_paint?: number;
  largest_contentful_paint?: number;
  first_input_delay?: number;
  cumulative_layout_shift?: number;
}
```

### Page Analytics Route

The `/page-analytics/[...pagefilter]` route accepts the following URL patterns:

- `/page-analytics/[page-path]`: Shows analytics for the specified page using the last 30 days as the default date range
- `/page-analytics/[page-path]/[start-date]/[end-date]`: Shows analytics for the specified page and date range

For the root page, use `%20root` as the page-path parameter.

The server component queries MongoDB for:
1. Scroll events for the page within the date range
2. Click events for the page within the date range
3. Performance metrics for the page within the date range
4. Total unique visitors for the page within the date range
5. All available page paths within the date range

This data is then passed to the client component for rendering the visualizations.

<h2 style="background-color:#000E2F; color:white; padding:4px;">Development</h2>

- Run linter: `npm run lint`
- Build for production: `npm run build`
- Start production server: `npm run start`

<h2 style="background-color:#000E2F; color:white; padding:4px;">License</h2>

Private

---

This project was bootstrapped with [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
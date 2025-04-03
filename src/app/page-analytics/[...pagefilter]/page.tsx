import { getEvents, getTotalPageVisitors } from '@/app/lib/mongo';
import { ClickEvent, ScrollEvent } from '@/app/lib/types';
import PageAnalyticsClient from './page-client';

// Get date range for last month (last 30 days)
function getLastMonthDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  // Format as YYYY-MM-DD
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

// Parse the pagefilter to extract page path and date range
function parseSlug(pagefilter: string[]): {
  pagePath: string;
  startDate: string;
  endDate: string;
} {
  // If only page path is provided, use last month as default date range
  if (pagefilter.length === 1) {
    const { startDate, endDate } = getLastMonthDateRange();
    return {
      pagePath: pagefilter[0],
      startDate,
      endDate,
    };
  }

  // If all parameters are provided, use them
  return {
    pagePath: pagefilter[0],
    startDate: pagefilter[1],
    endDate: pagefilter[2],
  };
}

// Fetch scroll data from MongoDB for a specific page and date range
async function getScrollData(
  pagePath: string,
  startDate: string,
  endDate: string,
): Promise<ScrollEvent[]> {
  try {
    // Get scroll events with date range
    const data = await getEvents<ScrollEvent>({
      eventType: 'scroll',
      startDate,
      endDate,
      pagePath,
      limit: 100,
    });

    console.log('MongoDB data count:', data.length);
    return JSON.parse(JSON.stringify(data)) as ScrollEvent[];
  } catch (error) {
    console.error('Failed to fetch scroll data:', error);
    return [];
  }
}

async function getClickData(
  pagePath: string,
  startDate: string,
  endDate: string,
): Promise<ClickEvent[]> {
  try {
    const data = await getEvents<ClickEvent>({
      eventType: 'click',
      startDate,
      endDate,
      pagePath,
      limit: 100,
    });
    return JSON.parse(JSON.stringify(data)) as ClickEvent[];
  } catch (error) {
    console.error('Failed to fetch click data:', error);
    return [];
  }
}

// This is the recommended pattern for Next.js 14+
export default async function Page({ params }: { params: { pagefilter: string[] } }) {
  // Properly await the params object
  const { pagefilter } = await params;

  // Validate we have at least the page path parameter
  if (!pagefilter || pagefilter.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid URL Format</h1>
        <p>
          Expected format: /page-analytics/[page-path] or
          /page-analytics/[page-path]/[start-date]/[end-date]
        </p>
        <p className="mt-2 text-sm">Use &quot;%20root&quot; to represent the root path.</p>
      </div>
    );
  }

  // Also validate if we have 2 parameters (which is invalid - we need either 1 or 3)
  if (pagefilter.length === 2) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid URL Format</h1>
        <p>
          Expected format: /page-analytics/[page-path] or
          /page-analytics/[page-path]/[start-date]/[end-date]
        </p>
        <p className="mt-2 text-sm">You provided 2 parameters which is ambiguous.</p>
      </div>
    );
  }

  const { pagePath, startDate, endDate } = parseSlug(pagefilter);
  const parsedPagePath = getParsedPagePath(pagePath);
  const scrollData = await getScrollData(parsedPagePath, startDate, endDate);
  const clickData = await getClickData(parsedPagePath, startDate, endDate);
  const totalPageVisitors = await getTotalPageVisitors(startDate, endDate, parsedPagePath);
  // If no data is found for this page, show a message
  if (scrollData.length === 0) {
    return <div>No data found for this page</div>;
  }

  // Get the page title from the first event
  const pageTitle = scrollData[0]?.page_title || 'Page Analytics';

  // Format the date range for display
  const dateRangeText = ` (${new Date(startDate).toLocaleDateString()} - ${new Date(
    endDate,
  ).toLocaleDateString()})`;
  return (
    <PageAnalyticsClient
      scrollData={scrollData}
      clickData={clickData}
      totalPageVisitors={totalPageVisitors}
      pageTitle={pageTitle}
      dateRangeText={dateRangeText}
      dateRange={{ startDate, endDate }}
    />
  );
}

function getParsedPagePath(pagePath: string): string {
  console.log('pagePath', pagePath);
  if (pagePath === '%20root') {
    return '/';
  }
  return '/' + pagePath;
}

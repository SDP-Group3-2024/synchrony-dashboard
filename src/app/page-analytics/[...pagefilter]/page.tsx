import { getScrollEvents } from '@/app/lib/mongo';
import { ScrollEvent } from '@/app/lib/types';
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
    // if the page path is %20root, convert it to /
    if (pagePath === '%20root') {
      pagePath = '';
    }

    // Get scroll events with date range
    const data = await getScrollEvents({
      startDate,
      endDate,
      pagePath: '/' + pagePath,
      limit: 100,
    });

    console.log('MongoDB data count:', data.length);

    // If no events found, return test data
    if (data.length === 0) {
      console.log('No events found, returning test data');
      return [
        {
          _id: 'test-id',
          event_type: 'scroll',
          session_id: 'test-session',
          timestamp: Date.now() / 1000,
          page_url: `https://example.com${pagePath}`,
          page_path: pagePath,
          page_title: `Test Page for ${pagePath}`,
          scroll_depth: 50,
          scroll_direction: 'down',
          viewport_height: 900,
          document_height: 2000,
          event_id: 'test-event-id',
          user_ip: '127.0.0.1',
          user_agent: 'Test Agent',
        },
      ];
    }

    return JSON.parse(JSON.stringify(data)) as ScrollEvent[];
  } catch (error) {
    console.error('Failed to fetch scroll data:', error);
    // Return test data for error cases
    return [
      {
        _id: 'error-id',
        event_type: 'scroll',
        session_id: 'error-session',
        timestamp: Date.now() / 1000,
        page_url: `https://example.com/error`,
        page_path: `/error`,
        page_title: `Error Page`,
        scroll_depth: 0,
        scroll_direction: 'none',
        viewport_height: 900,
        document_height: 2000,
        event_id: 'error-event-id',
        user_ip: '127.0.0.1',
        user_agent: 'Error Agent',
      },
    ];
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
  const scrollData = await getScrollData(pagePath, startDate, endDate);

  // If no data is found for this page, show a message
  if (scrollData.length === 0) {
    return <div>No data found for this page</div>;
  }

  // Get the page title from the first event
  const pageTitle = scrollData[0]?.page_title || 'Page Analytics';

  // Get unique pages for the filter
  const uniquePages = Array.from(new Set(scrollData.map((event) => event.page_title)));

  // Format the date range for display
  const dateRangeText = ` (${new Date(startDate).toLocaleDateString()} - ${new Date(
    endDate,
  ).toLocaleDateString()})`;

  return (
    <PageAnalyticsClient
      scrollData={scrollData}
      pageTitle={pageTitle}
      pagePath={pagePath}
      dateRangeText={dateRangeText}
      uniquePages={uniquePages}
      dateRange={{ startDate, endDate }}
    />
  );
}

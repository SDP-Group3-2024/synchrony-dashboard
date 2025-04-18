import {
  getEvents,
  getTotalPageVisitors,
  getPagePaths,
} from '@/app/lib/analytics-repository';
import { ClickEvent, PerformanceEventData, ScrollEvent } from '@/app/lib/types';
import PageAnalyticsClient from './page-client';

// --- Helper Functions ---

function getLastMonthDateRange(): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  console.log('startDate:', startDate, 'endDate:', endDate);
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}

function parseSlug(pagefilter: string[]): {
  pagePath: string;
  startDate: string;
  endDate: string;
} {
  console.log('pagefilter:', pagefilter);
  if (pagefilter.length === 1) {
    const { startDate, endDate } = getLastMonthDateRange();
    return {
      pagePath: pagefilter[0],
      startDate,
      endDate,
    };
  }
  return {
    pagePath: pagefilter[0],
    startDate: pagefilter[1],
    endDate: pagefilter[2],
  };
}

// Updated function to use '_root'
function getParsedPagePath(pagePathSlug: string): string {
  console.log('pagePathSlug received:', pagePathSlug);
  if (pagePathSlug === '_root') {
    return '/'; // Return the root path
  }
  // Ensure path starts with a single '/' and remove any leading slash from the slug itself
  return '/' + pagePathSlug.replace(/^\//, '');
}

// --- Data Fetching Functions (Assume getEvents returns serializable data) ---

async function getScrollData(
  pagePath: string,
  startDate: string,
  endDate: string,
): Promise<ScrollEvent[]> {
  try {
    const data = await getEvents<ScrollEvent>({
      eventType: 'scroll',
      startDate,
      endDate,
      pagePath,
      limit: 100,
    });
    return data;
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
    return data;
  } catch (error) {
    console.error('Failed to fetch click data:', error);
    return [];
  }
}

async function getPerformanceData(
  pagePath: string,
  startDate: string,
  endDate: string,
): Promise<PerformanceEventData[]> {
  try {
    const data = await getEvents<PerformanceEventData>({
      eventType: 'performance',
      startDate,
      endDate,
      pagePath,
      limit: 100,
    });
    return data;
  } catch (error) {
    console.error('Failed to fetch performance data:', error);
    return [];
  }
}

// --- Page Component ---

export default async function Page({ params }: { params: { pagefilter: string[] } }) {
  const { pagefilter } = await params;
  console.log('pagefilter:', pagefilter);
  // --- Validation (Updated error message) ---
  if (!pagefilter || pagefilter.length === 0 || pagefilter.length === 2) {
    const message =
      pagefilter?.length === 2
        ? 'You provided 2 parameters which is ambiguous.'
        : 'Please provide a page path.';
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Invalid URL Format</h1>
        <p>
          Expected format: /page-analytics/[page-path] or
          /page-analytics/[page-path]/[start-date]/[end-date]
        </p>
        <p className="mt-2 text-sm">{message}</p>
        {/* Updated instruction to use _root */}
        <p className="mt-2 text-sm">
          Use &quot;_root&quot; to represent the root path (/).
        </p>
      </div>
    );
  }

  // --- Parse Parameters ---
  // rawPagePath will be '_root' or 'some-page' etc.
  const { pagePath: rawPagePath, startDate, endDate } = parseSlug(pagefilter);
  console.log('rawPagePath:', rawPagePath, 'startDate:', startDate, 'endDate:', endDate);
  // parsedPagePath will be '/' or '/some-page' etc.
  const parsedPagePath = getParsedPagePath(rawPagePath);

  // --- Fetch Data in Parallel ---
  let scrollData: ScrollEvent[] = [];
  let clickData: ClickEvent[] = [];
  let performanceData: PerformanceEventData[] = [];
  let totalPageVisitors: number = 0;
  let pagePaths: string[] = [];

  try {
    [scrollData, clickData, performanceData, totalPageVisitors, pagePaths] =
      await Promise.all([
        getScrollData(parsedPagePath, startDate, endDate),
        getClickData(parsedPagePath, startDate, endDate),
        getPerformanceData(parsedPagePath, startDate, endDate),
        getTotalPageVisitors(startDate, endDate, parsedPagePath),
        getPagePaths(startDate, endDate),
      ]);
  } catch (error) {
    console.error('Error fetching page analytics data in parallel:', error);
    // Consider rendering a more specific error UI here
  }

  // --- Process Data ---
  const pageTitle = scrollData[0]?.page_title || `Analytics: ${parsedPagePath}`;
  const dateRangeText = ` (${new Date(
    `${startDate}T12:00:00Z`,
  ).toLocaleDateString()} - ${new Date(`${endDate}T12:00:00Z`).toLocaleDateString()})`;

  // --- Render Client Component ---
  return (
    <PageAnalyticsClient
      scrollData={scrollData}
      clickData={clickData}
      performanceData={performanceData}
      totalPageVisitors={totalPageVisitors}
      pageTitle={pageTitle}
      dateRangeText={dateRangeText}
      dateRange={{ startDate, endDate }}
      pagePath={parsedPagePath}
      pagePaths={pagePaths}
    />
  );
}

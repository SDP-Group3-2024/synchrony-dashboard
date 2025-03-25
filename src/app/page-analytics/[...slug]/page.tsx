import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getScrollEvents } from '@/app/lib/mongo';
import { ScrollEvent } from '@/app/lib/types';
import PageAnalyticsClient from './page-client';

// Parse the slug to extract page path and date range
function parseSlug(slug: string[]): {
  pagePath: string;
  startDate?: string;
  endDate?: string;
} {
  console.log('slug', slug);

  if (slug.length === 1) {
    return { pagePath: slug[0] };
  }

  if (slug.length === 3) {
    return {
      pagePath: slug[0],
      startDate: slug[1],
      endDate: slug[2],
    };
  }

  return { pagePath: slug[0] };
}

// Fetch scroll data from MongoDB for a specific page and date range
async function getScrollData(slug: string[]): Promise<ScrollEvent[]> {
  try {
    const { pagePath, startDate, endDate } = parseSlug(slug);
    console.log('pagePath', pagePath);
    console.log('startDate', startDate);
    console.log('endDate', endDate);

    // Get scroll events with date range if provided
    const data = await getScrollEvents({ startDate, endDate, pagePath, limit: 100 });
    console.log('MongoDB data count:', data.length);

    // Filter events for the specific page
    const pageEvents = data.filter(
      (event) => event.page_path === `/${pagePath}` || event.page_path === pagePath,
    );

    console.log('Filtered events count:', pageEvents.length);

    // If no events found, return some test data for development
    if (pageEvents.length === 0) {
      console.log('No events found, returning test data');
      return [
        {
          _id: 'test-id',
          event_type: 'scroll',
          session_id: 'test-session',
          timestamp: Date.now() / 1000,
          page_url: `https://example.com/${pagePath}`,
          page_path: `/${pagePath}`,
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

    return JSON.parse(JSON.stringify(pageEvents)) as ScrollEvent[];
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

export default async function Page({ params }: { params: { slug: string[] } }) {
  await params;
  console.log('params', params);
  const scrollData = await getScrollData(params.slug);

  // If no data is found for this page, show a message
  if (scrollData.length === 0) {
    return <div>No data found for this page</div>;
  }

  // Get the page title from the first event
  const pageTitle = scrollData[0]?.page_title || 'Page Analytics';
  const { pagePath, startDate, endDate } = parseSlug(params.slug);

  // Get unique pages for the filter
  const uniquePages = Array.from(new Set(scrollData.map((event) => event.page_title)));

  // Format the date range for display
  const dateRangeText =
    startDate && endDate
      ? ` (${new Date(startDate).toLocaleDateString()} - ${new Date(
          endDate,
        ).toLocaleDateString()})`
      : '';

  return (
    <PageAnalyticsClient
      scrollData={scrollData}
      pageTitle={pageTitle}
      pagePath={pagePath}
      dateRangeText={dateRangeText}
      uniquePages={uniquePages}
      dateRange={startDate && endDate ? { startDate, endDate } : undefined}
    />
  );
}

'use client';

import { ScrollEvent } from '@/app/lib/types';
import { AppSidebar } from '@/components/app-sidebar';
import { ScrollAnalytics } from '@/components/charts/scroll-analytics';
import { ScrollFilters } from '@/components/charts/scroll-filters';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface PageAnalyticsClientProps {
  scrollData: ScrollEvent[];
  pageTitle: string;
  pagePath: string;
  dateRangeText: string;
  uniquePages: string[];
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export default function PageAnalyticsClient({
  scrollData,
  pageTitle,
  pagePath,
  dateRangeText,
  uniquePages,
  dateRange,
}: PageAnalyticsClientProps) {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* Main Content Area */}
      <SidebarInset>
        {/* Header with Sidebar Toggle */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {/* Main Content Grid */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="col-span-full w-full">
            <h1 className="text-2xl font-bold mb-4">
              Scroll Behavior Analytics for {pageTitle}
              {dateRangeText}
            </h1>

            {/* Filters */}
            <div className="mb-6">
              <ScrollFilters
                initialDateRange={dateRange}
                pagePath={pagePath}
                uniquePages={uniquePages}
              />
            </div>

            {/* Analytics */}
            <ScrollAnalytics
              data={scrollData}
              dateRange={dateRange}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
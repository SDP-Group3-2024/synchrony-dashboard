import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import ScrollAnalyticsWrapper from "@/components/charts/scroll-analytics-wrapper";
import { getScrollEvents } from "@/app/lib/mongo";
import { ScrollEvent } from "@/app/lib/types";

// Fetch scroll data from MongoDB
async function getScrollData(): Promise<ScrollEvent[]> {
  try {
    // Get the most recent scroll events (limit to 100 for performance)
    const data = await getScrollEvents(undefined, undefined, 100);
    console.log(data);
    return JSON.parse(JSON.stringify(data)) as ScrollEvent[];
  } catch (error) {
    console.error("Failed to fetch scroll data:", error);
    return [];
  }
}

export default async function Page() {
  const scrollData = await getScrollData();

  return (
    <SidebarProvider>
      <AppSidebar />

      {/* Main Content Area */}
      <SidebarInset>
        {" "}
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
                <BreadcrumbPage>Scroll Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {/* Main Content Grid */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="col-span-full w-full">
            <h1 className="text-2xl font-bold mb-4">
              Scroll Behavior Analytics
            </h1>
            <ScrollAnalyticsWrapper initialData={scrollData} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

import { AppSidebar } from "@/components/app-sidebar";
import { GradientGraph } from "@/components/charts/gradient-graph";
import { LineGraph } from "@/components/charts/line-graph";
import { PieGraph } from "@/components/charts/pie-graph";
import { BarGraph } from "@/components/charts/bar-graph";
import { RadarGraph } from "@/components/charts/radar-graph";
import { DropdownGraph } from "@/components/charts/dropdown-graph";
import UserJourneyTable from "@/app/table/UserJourneyTable";
import { SnakeyGraph } from "@/components/charts/snakey";
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
import { getEvents } from "@/app/lib/dynamodb";

export default async function Page() {
  const events = await getEvents("page_exit");
  console.log(events);

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
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {/* Main Content Grid */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 sm:grid-cols-1 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/75">
              <BarGraph />
            </div>
            <div className="aspect-video rounded-xl bg-muted/75">
              <LineGraph />
            </div>
            <div className="aspect-video rounded-xl bg-muted/75">
              <GradientGraph />
            </div>
            <div className="aspect-video rounded-xl bg-muted/75">
              <PieGraph />
            </div>
            <div className="aspect-video rounded-xl bg-muted/75">
              <RadarGraph />
            </div>
            <div className="aspect-video rounded-xl bg-muted/75">
              <SnakeyGraph />
            </div>

            {/* Full-width Section for Table and Dropdown */}
            <div className="col-span-full w-full">
              <DropdownGraph />
            </div>
            <div className="col-span-full w-full">
              <UserJourneyTable />
            </div>
            <div className="col-span-full w-full">
              <SnakeyGraph />
            </div>
          </div>

          {/* Additional Space for Future Content */}
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/75 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

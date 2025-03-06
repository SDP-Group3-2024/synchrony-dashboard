import { AppSidebar } from "@/components/app-sidebar";
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

export default async function Page() {
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
          <div className="col-span-full w-full">
            <SnakeyGraph />
          </div>

          {/* Additional Space for Future Content */}
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/75 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

import { AppSidebar } from "@/components/app-sidebar"
import { GradientGraph } from "@/components/charts/gradient-graph"
import { LineGraph } from "@/components/charts/line-graph"
import { PieGraph } from "@/components/charts/pie-graph"
import { BarGraph } from "@/components/charts/bar-graph"
import { RadarGraph } from "@/components/charts/radar-graph"
import { DropdownGraph } from "@/components/charts/dropdown-graph"
import UserJourneyTable from "@/app/table/UserJourneyTable"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Page() {
  return (
    <SidebarProvider>
      {/* Insert side bar tag below*/}
      <AppSidebar />
      {/* SidebarInset will hold out main content */}
      <SidebarInset>
        {/* Header tag will hold the button to enable/disable the sidebar */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" /> 
        </header>
        {/* Main content below */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/75">
              <BarGraph></BarGraph>
            </div> 
            <div className="aspect-video rounded-xl bg-muted/75">
                <LineGraph></LineGraph>
            </div>
            <div className="aspect-video rounded-xl bg-muted/75">
                <GradientGraph></GradientGraph>
            </div>
            <div className="aspect-video rounded-xl bg-muted/75">
                <PieGraph></PieGraph>
            </div>
            <div className="aspect-video rounded-xl bg-muted/75">
                <RadarGraph></RadarGraph>
            </div>
            <div className="aspect-video rounded-xl bg-muted/75">
                <GradientGraph></GradientGraph>
            </div>
            {/* TODO: I want this div below to stretch the entire width */}
            <div className="col-span-full">

              <DropdownGraph></DropdownGraph>


              <UserJourneyTable></UserJourneyTable>
            </div>
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/75 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

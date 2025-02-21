import { Group, Layers, Map as MapIcon, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import LayerList from "./layers/LayerList"

const menuItems = [
  {
    title: "Map Settings",
    icon: MapIcon,
    url: "/settings"
  },
  {
    title: "Settings",
    icon: Settings,
    url: "/settings"
  }
]

export default function AppSidebar() {
  const { state } = useSidebar()

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="h-16 flex items-center justify-center">
        <div className="flex items-center justify-center">
            <img 
            src="/logo.png" 
            alt="SharkGIS" 
            className={`transition-all duration-200 ease-linear ${
                state === "expanded" ? "w-14 h-14" : "w-8 h-8"
            }`}
            />
            <h1 className={`text-2xl font-bold transition-all duration-200 ease-linear ${
                state === "expanded" ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}>SharkGIS</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <Group className="h-4 w-4" />
              GroupLabel
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Accordion type="single" collapsible defaultValue="layers">
                <AccordionItem value="layers" className="border-none">
                  <AccordionTrigger className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      <span>Layers</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <LayerList />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
import { useState, useEffect } from "react"
import { Group, Layers, Settings, Wrench } from "lucide-react"
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
import ToolList from "./tools/ToolList"
import { getPublicPath } from "@/lib/utils"
import SettingsDialog from "./SettingsDialog"

const menuItems = [
  { title: "Layers", icon: Layers },
  { title: "Tools", icon: Wrench },
  { title: "Settings", icon: Settings },
]

export default function AppSidebar() {
  const { state } = useSidebar()


  const [isLayersExpanded, setIsLayersExpanded] = useState(true)
  const [isToolsExpanded, setIsToolsExpanded] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (state !== "expanded") {
      setIsLayersExpanded(false)
      setIsToolsExpanded(false)
    }
  }, [state])

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="h-16 flex items-center justify-center">
        <div className="flex items-center justify-center">
          <img
            src={getPublicPath("/logo.png")}
            alt="SharkGIS"
            className={`transition-all duration-200 ease-linear ${
              state === "expanded" ? "w-14 h-14" : "w-8 h-8"
            }`}
          />
          <h1
            className={`text-2xl font-bold transition-all duration-200 ease-linear ${
              state === "expanded" ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            SharkGIS
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
    
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.title === "Layers" && state === "expanded") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Accordion
                        type="single"
                        collapsible
                        // If isLayersExpanded is true, the active accordion is "layers."
                        // If false, no accordion item is open (an empty string).
                        value={isLayersExpanded ? "layers" : ""}
                        onValueChange={(val) => {
                          // If user clicked to open “layers,” val will be "layers";
                          // if user clicked to close it, val will be "".
                          setIsLayersExpanded(val === "layers")
                        }}
                      >
                        <AccordionItem value="layers" className="border-none">
                          <SidebarMenuButton asChild>
                            <AccordionTrigger className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                              <div className="flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                <span className="text-lg">Layers</span>
                              </div>
                            </AccordionTrigger>
                          </SidebarMenuButton>
                          <AccordionContent>
                            <LayerList />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </SidebarMenuItem>
                  )
                } else if (item.title === "Tools" && state === "expanded") {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Accordion
                        type="single"
                        collapsible
                        value={isToolsExpanded ? "tools" : ""}
                        onValueChange={(val) => {
                          setIsToolsExpanded(val === "tools")
                        }}
                      >
                        <AccordionItem value="tools" className="border-none">
                          <SidebarMenuButton asChild>
                            <AccordionTrigger className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                              <div className="flex items-center gap-2">
                                <Wrench className="h-5 w-5" />
                                <span className="text-lg">Tools</span>
                              </div>
                            </AccordionTrigger>
                          </SidebarMenuButton>
                          <AccordionContent>
                            <ToolList />
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </SidebarMenuItem>
                  )
                } else {
                  // Everything else remains the same
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => setSettingsOpen(true)}     /* ⟵ open dialog */
                        className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-lg">Settings</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
              <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </SidebarContent>
    </Sidebar>
  )
}

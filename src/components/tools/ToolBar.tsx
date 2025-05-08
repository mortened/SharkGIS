import { useState } from "react"
import { Sidebar } from "../ui/sidebar"
import { Button } from "../ui/button"
import { getPublicPath } from "@/lib/utils"
import { BufferDialog } from "./BufferDialog"
import PolygonToolDialog from "./PolygonToolDialog"
import DissolveDialog from "./DissolveDialog"

const ToolBarItems = [
  { name: "Buffer", icon: "buffer" },
  {name : "Intersect", icon: "intersect"},
  {name : "Union", icon: "union"},
  {name : "Difference", icon: "difference"},
  {name: "Dissolve", icon: "dissolve"},
  {name: "Clip", icon: "clip"},
  {name: "Voronoi", icon: "voronoi"},
  // Add other tools here
]

export default function ToolBar() {
  // Track which tool is open and whether the dialog is visible
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function openToolDialog(toolName: string) {
    setActiveTool(toolName)
    setIsDialogOpen(true)
  }

  console.log("activeTool =", activeTool)

  return (
    <Sidebar side="bottom" className="bg-white/90">
      <div className="flex gap-2 p-2 flex-row justify-center">
        {ToolBarItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            size="lg"
            onClick={() => openToolDialog(item.name)}
            className="flex flex-col items-center"
          >
            <img
              src={getPublicPath(`/icons/${item.icon}.svg`)}
              alt={item.name}
              className="h-8 w-8"
            />
            <span className="text-xs">{item.name}</span>
          </Button>
        ))}

        {activeTool === "Buffer" && (
          <BufferDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )}

        {activeTool === "Intersect" && (
          <PolygonToolDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            operation="Intersect"
          />
        )}

        {activeTool === "Union" && (
          <PolygonToolDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            operation="Union"
          />
        )}

        {activeTool === "Difference" && (
          <PolygonToolDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            operation="Difference"
          />
        )}


        {activeTool === "Dissolve" && (
          <DissolveDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )}

        

      </div>
    </Sidebar>
  )
}

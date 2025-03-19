import { useState } from "react"
import { Sidebar } from "../ui/sidebar"
import { Button } from "../ui/button"
import { getPublicPath } from "@/lib/utils"
import { BufferDialog } from "./BufferDialog"
import { IntersectDialog } from "./IntersectDialog"
import PolygonToolDialog from "./PolygonToolDialog"

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

        {/* {activeTool === "Intersect" && (
          <IntersectDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )} */}

        {activeTool === "Intersect" && (
          <PolygonToolDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            operation="Intersect"
            desriptopn="Finds the overlapping area between two or more input layers, returning only the portions where they overlap."
          />
        )}

        {activeTool === "Union" && (
          <PolygonToolDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            operation="Union"
            desriptopn="Combines two polygon layers into one layer that includes all areas from each input. Overlapping regions become separate features, reflecting all layer combinations."
          />
        )}

        {activeTool === "Difference" && (
          <PolygonToolDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            operation="Difference"
            desriptopn="Removes areas of overlap from one layer by using another. Anything outside the overlap is retained, while the overlapping part is subtracted."
          />
        )}

        




        

      </div>
    </Sidebar>
  )
}

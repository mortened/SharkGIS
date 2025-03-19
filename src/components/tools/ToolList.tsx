import { getPublicPath } from "@/lib/utils"
import { Button } from "../ui/button"
import { useState } from "react"
import PolygonToolDialog from "./PolygonToolDialog"
import { BufferDialog } from "./BufferDialog"

const tools = [
    { name: "Buffer", icon: "buffer" },
    {name : "Intersect", icon: "intersect"},
    {name : "Union", icon: "union"},
    {name : "Difference", icon: "difference"},
    {name: "Dissolve", icon: "dissolve"},
    {name: "Clip", icon: "clip"},
    {name: "Voronoi", icon: "voronoi"},
    // Add other tools here
]

export default function ToolList() {
    const [activeTool, setActiveTool] = useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    
      function openToolDialog(toolName: string) {
        setActiveTool(toolName)
        setIsDialogOpen(true)
      }

    return (
        <div className="flex flex-col">
            {tools.map((item) => (
                <Button
                    key={item.name}
                    variant="ghost"
                    size="lg"
                    onClick={() => openToolDialog(item.name)}
                    className="m-2 justify-start"
                >
                    <img
                        src={getPublicPath(`/icons/${item.icon}.svg`)}
                        alt={item.name}
                        className="h-6 w-6" 
                    />
                    <span className="text-s">{item.name}</span>
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
        </div>
    )
}
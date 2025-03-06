import { useState } from "react"
import { Sidebar } from "../ui/sidebar"
import { Button } from "../ui/button"
import { getPublicPath } from "@/lib/utils"
import { BufferDialog } from "./BufferDialog"

const ToolBarItems = [
  { name: "Buffer", icon: "buffer" },
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
      <div className="flex items-center justify-center gap-2 p-2">
        {ToolBarItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            size="icon"
            onClick={() => openToolDialog(item.name)}
            className="flex items-center gap-1"
          >
            {item.name}
            <img
              src={getPublicPath(`/icons/${item.icon}.svg`)}
              alt={item.name}
              className="h-6 w-6"
            />
          </Button>
        ))}

        {/* Render the tool's dialog conditionally, 
            depending on which tool is active. 
            For now, we only have "Buffer". */}
        {activeTool === "Buffer" && (
          <BufferDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )}
      </div>
    </Sidebar>
  )
}

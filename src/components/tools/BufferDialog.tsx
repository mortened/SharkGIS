import { useState } from "react"
import { ToolDialogShell } from "./ToolDialogShell"
import BufferTool from "./BufferTool"

interface BufferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BufferDialog({ open, onOpenChange }: BufferDialogProps) {
  // The parent owns all state:
  const [selectedLayerId, setSelectedLayerId] = useState("")
  const [bufferDistance, setBufferDistance] = useState<number | null>(null)
  const [layerName, setLayerName] = useState("")

  // This is the "save" logic
  function onSave() {
    // Because the parent has all the form data, we can validate here
    if (!selectedLayerId || !bufferDistance) {
      alert("Please fill all fields!")
      return
    }
    // Otherwise, do the geoprocessing, or pass data to your store, etc.
    console.log("Saving with:", { selectedLayerId, bufferDistance, layerName })
    onOpenChange(false)
  }

  return (
    <ToolDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Buffer"
      onSave={onSave}
    >
      <BufferTool
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
        bufferDistance={bufferDistance}
        setBufferDistance={setBufferDistance}
        layerName={layerName}
        setLayerName={setLayerName}
      />
    </ToolDialogShell>
  )
}

import { getPublicPath } from "@/lib/utils";
import { Button } from "../ui/button";
import { useState } from "react";
import { BufferDialog } from "./BufferDialog";
import DissolveDialog from "./DissolveDialog";
import { FeatureExtractionDialog } from "./FeatureExtractionDialog";
import { UnionDialog } from "./UnionDialog";
import { IntersectDialog } from "./IntersectDialog";
import { DifferenceDialog } from "./DifferenceDialog";
import { ClipDialog } from "./ClipDialog";
import VoronoiDialog from "./VoronoiDialog";
// List of all tools in the sidebar, with their names and icons
const tools = [
  { name: "Buffer", icon: "buffer" },
  { name: "Intersect", icon: "intersect" },
  { name: "Union", icon: "union" },
  { name: "Difference", icon: "difference" },
  { name: "Dissolve", icon: "dissolve" },
  { name: "Clip", icon: "clip" },
  { name: "Voronoi", icon: "voronoi" },
  { name: "Feature extraction", icon: "filter" },
];

export default function ToolList() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Function to open the dialog for a specific tool
  function openToolDialog(toolName: string) {
    setActiveTool(toolName);
    setIsDialogOpen(true);
  }

  return (
    <div className="flex flex-col">
      {/* maps through the tools array and creates a button for each tool with corresponding icon, name and click handler */}
      {tools.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          size="lg"
          onClick={() => openToolDialog(item.name)}
          className={`m-2 justify-start${
            item.name === "Feature extraction" ? " feature-extractor-btn" : ""
          }${item.name === "Clip" ? " clip-tool-btn" : ""}${
            item.name === "Dissolve" ? " dissolve-tool-btn" : ""
          } ${item.name === "Buffer" ? " buffer-tool-btn" : ""} ${
            item.name === "Difference" ? " difference-tool-btn" : ""
          } `}
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
        <BufferDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}
      {activeTool === "Intersect" && (
        <IntersectDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}
      {activeTool === "Union" && (
        <UnionDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}
      {activeTool === "Difference" && (
        <DifferenceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}

      {activeTool === "Dissolve" && (
        <DissolveDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}

      {activeTool === "Clip" && (
        <ClipDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}

      {activeTool === "Voronoi" && (
        <VoronoiDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}

      {activeTool === "Feature extraction" && (
        <div className="feature-extractor">
          <FeatureExtractionDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        </div>
      )}
    </div>
  );
}

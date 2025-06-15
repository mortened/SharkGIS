import { useState } from "react";
import { getPublicPath, getUniqueColor } from "@/lib/utils";
import { Sidebar } from "./ui/sidebar";
import { Button } from "./ui/button";
import { LayerUploadDialog } from "./layers/LayerUploadDialog";
import { BookText, Check, Plus } from "lucide-react";
import { useDrawStore } from "@/hooks/useDrawStore";
import { useSidebar } from "./ui/sidebar";
import { X, RotateCcw } from "lucide-react";
import { FeatureCollection } from "geojson";
import { Layer, useLayers } from "@/hooks/useLayers";
import { NiceTooltip } from "./tools/NiceToolTip";
import { FeatureJoyride } from "@/tutorial/FeatureJoyride";
import { ROUTE_DRAWING_STEPS } from "@/tutorial/steps";

export default function TopBar() {
  // Track which tool is open and whether the dialog is visible
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [activeGeometry, setActiveGeometry] = useState<string | null>(null);
  // Access the draw store and sidebar state
  const draw = useDrawStore((state) => state.draw);
  const { setOpen } = useSidebar();
  const { addLayer, layers } = useLayers();
  // State for route drawing steps
  const [runRouteSteps, setRunRouteSteps] = useState(false);
  const [routeStepIndex, setRouteStepIndex] = useState(0);
  // tutorial steps for route drawing
  const routeBookTrigger = (
    <Button
      onClick={() => setRunRouteSteps(true)}
      variant="secondary"
      size="icon"
    >
      <BookText
        style={{ width: "1.8rem", height: "1.8rem", fill: "#ff8847" }}
      />
    </Button>
  );
  // Function to draw a layer based on the selected geometry type
  // This function sets the active geometry and changes the draw mode accordingly
  function drawLayer(geometry: string): void {
    if (!draw) return;
    setActiveGeometry(geometry);
    setIsDisabled(true);

    switch (geometry) {
      case "point":
        draw.changeMode("draw_point");
        break;
      case "line":
        draw.changeMode("draw_line_string");
        break;
      case "polygon":
        draw.changeMode("draw_polygon");
        break;
    }

    setOpen(false);
  }

  // Function to save the drawn layer
  // It validates the geometries, adds properties, and calls addLayer to save it
  function saveLayer(fc: FeatureCollection | null): void {
    if (!fc || fc.features.length === 0) return;

    /* validate geometries … */

    const withProps: FeatureCollection = {
      ...fc,
      features: fc.features.map((f, i) => ({
        ...f,
        properties: {
          ...(f.properties || {}),
          DrawID: i + 1,
          Geometry: f.geometry.type,
        },
      })),
    };

    const geomType = withProps.features[0].geometry
      .type as Layer["geometryType"];

    addLayer(
      {
        id: `layer-${layers.length + 1}`,
        name: `Layer ${layers.length + 1}`,
        data: withProps,
        fillColor: getUniqueColor(),
        fillOpacity: 1,
        visible: true,
        geometryType: geomType,
      },
      getUniqueColor(),
      1
    );
  }

  return (
    <>
      {/* Top sidebar with upload and draw buttons */}
      <Sidebar side="top" className="bg-white/90">
        <div className="flex flex-row justify-center">
          <NiceTooltip label="Upload GeoJSON layer(s) to the map" side="top">
            <Button
              variant="ghost"
              size="default"
              onClick={() => setIsDialogOpen(true)}
              className="flex flex-row items-center upload-btn"
              disabled={isDisabled}
            >
              <Plus className="h-8 w-8" />
              <span className="text-xs">Upload</span>
            </Button>
          </NiceTooltip>
          <LayerUploadDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />

          <NiceTooltip label="Draw a new point layer on the map" side="top">
            <Button
              variant="ghost"
              size="sm"
              className=" h-100"
              onClick={() => drawLayer("point")}
              disabled={isDisabled}
            >
              <img
                src={getPublicPath(`/icons/point.svg`)}
                className="h-6 w-6"
              />
            </Button>
          </NiceTooltip>
          <NiceTooltip label="Draw a new line layer on the map" side="top">
            <Button
              variant="ghost"
              size="sm"
              className=" h-100 line-drawing-btn"
              onClick={() => drawLayer("line")}
              disabled={isDisabled}
            >
              <img src={getPublicPath(`/icons/line.svg`)} className="h-6 w-6" />
            </Button>
          </NiceTooltip>
          <NiceTooltip label="Draw a new polygon layer on the map" side="top">
            <Button
              variant="ghost"
              size="sm"
              className=" h-100"
              onClick={() => drawLayer("polygon")}
              disabled={isDisabled}
            >
              <img
                src={getPublicPath(`/icons/polygon.svg`)}
                className="h-6 w-6"
              />
            </Button>
          </NiceTooltip>
        </div>
      </Sidebar>
      {/* Bottom sidebar with drawing controls */}
      {isDisabled && (
        <Sidebar side="bottom" className="bg-white/90 bottom-toolbar">
          <div className="flex flex-row justify-center">
            {activeGeometry === "line" && routeBookTrigger}
            <NiceTooltip
              label="Cancel drawing and delete all drawn features"
              side="top"
            >
              <Button
                variant="ghost"
                size="default"
                onClick={() => {
                  if (!draw) return;
                  draw.changeMode("simple_select");
                  draw.deleteAll();
                  setActiveGeometry(null);
                  setOpen(false);
                  setIsDisabled(false);
                }}
              >
                <X className="h-8 w-8" />
                <span className="text-base">Cancel</span>
              </Button>
            </NiceTooltip>
            <NiceTooltip label="Delete all drawn features" side="top">
              <Button
                variant="ghost"
                size="default"
                onClick={() => {
                  if (!draw) return;
                  draw.deleteAll();
                  drawLayer(activeGeometry!);
                }}
              >
                <RotateCcw className="h-8 w-8" />
                <span className="text-base">Clear all</span>
              </Button>
            </NiceTooltip>
            <NiceTooltip label="Add another drawn feature" side="top">
              <Button
                variant="ghost"
                size="default"
                onClick={() => {
                  drawLayer(activeGeometry!);
                }}
              >
                <Plus className="h-8 w-8" />
                <span className="text-base">Add another</span>
              </Button>
            </NiceTooltip>
            <NiceTooltip label="Finish drawing and save the layer" side="top">
              <Button
                variant="ghost"
                size="default"
                className="finish-btn"
                onClick={() => {
                  setIsDisabled(false);
                  saveLayer(draw?.getAll() ?? null);
                  draw?.deleteAll();
                }}
              >
                <Check className="h-8 w-8" />
                <span className="text-base">Finish</span>
              </Button>
            </NiceTooltip>
          </div>
        </Sidebar>
      )}

      <FeatureJoyride
        steps={ROUTE_DRAWING_STEPS}
        run={runRouteSteps && isDisabled && activeGeometry === "line"}
        onStop={() => {
          setRunRouteSteps(false);
          setRouteStepIndex(0);
        }}
        stepIndex={routeStepIndex}
        onStepChange={(index) => setRouteStepIndex(index)}
        disableOverlay
      />
    </>
  );
}

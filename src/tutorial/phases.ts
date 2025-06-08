import { getPublicPath } from "@/lib/utils";

export interface TutorialPhase {
    title: string;
    body: string;
    image?: string;
    imageAlt?: string;
}

export interface Pointer {
  target:  string;
  content: string;
  placement?: "left" | "right" | "top" | "bottom";
}

export const TUTORIAL_PHASES: TutorialPhase[] = [
    {
        title: "Welcome to SharkGIS",
        body: "This tutorial showcases some key functionalities of the web app through a practical scenario: planning a safe kayak route in Trondheim's waterways.\n\nToggle this tutorial with the book icon, and note that refreshing the page will reset all progress including layers and settings.",
    },
    {
        title: "Map Navigation",
        body: "Navigate the map by clicking and dragging, or use your arrow keys to pan around. Zoom in and out by scrolling. You can toggle visual map controls on and off through the settings menu.\n\n",
    },
    {
        title: "The Kayaking Mission",
        body: "You and a friend have decided to explore Trondheim's waterways by kayak. As beginners, safety is your primary concern. Your route must meet three critical requirements: stay in shallow waters in case of capsize, maintain distance to other boat/ship traffic, and padle between 2-3 accessible launch points.",
        image: getPublicPath("/kayak.jpg"),
        imageAlt: "Kayaking in shallow waters",
    },
    {
        title: "Prepare Your Data",
        body: "Download the necessary data files from this [link](https://example.com/trondheim-kayak-data.zip). It contains:\n\n- `trondelag.geojson`: Trøndelag county boundary\n- `trondheim-depth.geojson`: Water depth polygons for Trondheim\n- `AIS.geojson`: Cleaned Automatic Identification System (AIS) data for boat/ships locations on a day in May 2025 \n- `swimming-spots.geojson`: Popular swimming spots around Norway",
    },
    {
        title: "Upload files to SharkGIS",
        body: "To start, upload the data files you downloaded. Click the Upload button in the top bar and select all four files at once.",
    },
    {
        title: "View Uploaded Layers",
        body: "Once uploaded, you will see the new layers appear in the sidebar. Click the eye icon to toggle visibility, and the three dots next to each layer name to access options like renaming, deleting, or downloading.",
    },

    {
        title: "Extract Trondheim Municipality",
        body: "Isolate just Trondheim from the larger county boundary. Open the Feature Extractor tool from the sidebar and follow the detailed steps inside the tool by clicking the book icon in the bottom left corner.",
    },
    {
        title: "Clean Up Your Workspace",
        body: "Delete the original 'trondelag-boundary' layer since you no longer need it. Click the three dots next to the layer name and select Delete Layer.\n\nNext, style your Trondheim boundary for better visibility. Click the three dots next to 'trondheim-boundary' and choose Layer Settings. Set the opacity to 10% so it remains visible but unobtrusive, and change the color to light gray.",
    },
    {
        title: "Clip The Data",
        body: "Trim the AIS data and swimming spots to only include areas within Trondheim's boundaries. The depth data is already limited to Trondheim. Open the Clip Tool from the sidebar and follow the steps inside the tool - again by clicking the book icon in the bottom left corner.",
    },
    {
        title: "Create Safety Buffers",
        body: "Create 300 meter safety buffers around the AIS points to try to stay clear of boat traffic. Open the Buffer Tool from the sidebar and follow the steps inside the tool.",
    },
    {
        title: "Identify Shallow Water Areas",
        body: "Use the Feature Extractor tool again to filter out deep waters from the depth polygons. Follow the steps inside the tool.",
    },
    {
        title: "Dissolve Shallow Water Areas",
        body: "To make the shallow water areas easier to work with, dissolve them into a single polygon. Open the Dissolve Tool from the sidebar and follow the steps inside the tool.",
    },
    {
        title: "Calculate Safe Kayaking Areas",
        body: "Subract the traffic buffers from the shallow water areas to find safe kayaking zones. Open the Difference Tool from the sidebar and follow the steps inside the tool.",
    },
    {
        title: "Plan Your Route",
        body: "Create your kayak route using the Line Drawing Tool. Select 2-3 swimming spots as waypoints and draw your path through the green 'safe-kayak-zones', avoiding traffic areas and deep water. Follow the steps inside the tool by clicking the book icon in the bottom toolbar which appears when you start drawing.",
        image: getPublicPath("/route.png"),
        imageAlt: "Example kayak route through safe waters",
    },
    {
        title: "Mission Accomplished",
        body: "Congratulations! You've successfully completed a comprehensive GIS analysis workflow. You extracted municipal boundaries, identified safe water depths, avoided shipping traffic zones, and planned an optimal kayak route.\n\nNext steps include exporting your route as GPX for GPS devices, experimenting with different styling options, and exploring other GIS tools. In real-world applications, always verify current weather and tide conditions before any water activities.",
    },
];

// Updated pointers with cleaner guidance
export const POINTERS: Record<number, Pointer> = {
    4: {
        target: ".upload-btn",
        content: "Click here to upload the data.",
        placement: "bottom",
    },
    5: {
        target: ".layer-list",
        content: "Your layers will appear here.",
        placement: "right",
    },
    6: {
        target: ".feature-extractor-btn",
        content: "Open Feature Extractor to isolate Trondheim municipality.",
        placement: "right",
    },
    8: {
        target: ".clip-tool-btn",
        content: "Use Clip Tool to trim AIS and swimming spots data to Trondheim boundaries.",
        placement: "right",
    },
    9: {
        target: ".buffer-tool-btn",
        content: "Create safety buffers around traffic points.",
        placement: "right",
    },
    10: {
        target: ".feature-extractor-btn",
        content: "Extract shallow water areas using Feature Extractor.",
        placement: "right",
    },
    11: {
        target: ".dissolve-tool-btn",
        content: "Dissolve shallow water areas into a single polygon.",
        placement: "right",
    },
    12: {
        target: ".difference-tool-btn",
        content: "Calculate safe areas by removing traffic zones from shallow water.",
        placement: "right",
    },
    13: {
        target: ".line-drawing-btn",
        content: "Draw your kayak route.",
        placement: "bottom",
    }
};

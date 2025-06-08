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
        body: "Download and unpack the necessary data files from this [link](https://github.com/mortened/SharkGIS/blob/main/src/tutorial/data/data.zip). It contains:\n\n- `trondelag.geojson`: Trøndelag county boundary\n- `trondheim-depth.geojson`: Water depth polygons for Trondheim\n- `AIS.geojson`: Cleaned Automatic Identification System (AIS) data for boat/ships locations on a day in May 2025 \n- `swimming-spots.geojson`: Popular swimming spots around Norway",
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
        body: "Delete the original 'trondelag' layer since you no longer need it. Click the three dots next to the layer name and select Delete Layer.\n\nNext, style and rename your 'trondelag-extracted' layer. Click the three dots next to it, choose Layer Settings, and rename it to 'trondheim'. Also set a low opacity and a light color, or hide it if you prefer.",
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
        title: "Prepare for Route Planning",
        body: "Now that you have the safe kayaking areas, you are nearly ready to plan your route. Hide (or delete) all layers except the 'kayaking-areas' layer and the clipped swimming-spots layer."
    },
    {
        title: "Plan Your Route",
        body: "Plan your kayak route using the Line Drawing Tool. Choose 2–3 swimming spots as waypoints, and draw your path through the green 'safe-kayak-zones'. To access guidance while drawing, click the book icon in the bottom toolbar that appears once the tool is active.\n\nTip: Before starting, click on the clipped swimming spots layer to highlight it with a red outline—this makes the spots easier to see while planning your route.\n\nNote: You may notice that the green kayaking zones don't fully reach the swimming spots. This is because the depth dataset doesn't extend all the way to the shoreline—but it's still shallow there, so you can assume safe water access near the beach/swimming spots.",
        image: getPublicPath("/route.png"),
        imageAlt: "Example kayak route through safe waters",
    },
    {
        title: "Mission Accomplished",
        body: "Congratulations! You've successfully completed the SharkGIS tutorial.\n\nTo save your route, click the three dots next to your newly created line layer (e.g., 'Layer X'), hover over 'Download Layer', and choose your preferred format—GeoJSON, GPX, or image.\n\nTip: If you download an image, it will include all currently visible layers. To customize the export, hide any layers you don’t want shown before downloading.\n\nWant to take it further? Export your route as a GPX file and load it into a GPS device or mobile app to try it out in the real world. Or stay in SharkGIS to explore new areas and sharpen your kayak route planning skills!",
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
    14: {
        target: ".line-drawing-btn",
        content: "Draw your kayak route.",
        placement: "bottom",
    }
};

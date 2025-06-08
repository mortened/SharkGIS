import { Step } from "react-joyride"

export const STEPS: Record<number, Step[]> = {
  3: [
    {
      target: ".upload-btn",
      content: "Click here to upload.",
      disableBeacon: true,
    },
  ],
  4: [
    {
      target: ".layer-list",
      content: "Your uploaded data will appear here. You can toggle layers on and off, change their order, and adjust styles.",
      disableBeacon: true,
    },
  ],
}

export const UPLOADSTEPS: Step[] = [
  {
    target: ".upload-files",
    content: "Drag and drop your files here, or click to select them.",
    disableBeacon: true,
  },
  {
    target: ".layer-form",
    content: "Configure color, opacity and name for your layer(s).",
    disableBeacon: true,
  },
  {
    target: ".layer-upload-btn",
    content: "Click here to upload your layer(s).",
    disableBeacon: true,
  }
]

export const FEATURE_EXTRACTOR_STEPS_1: Step[] = [
  {
    target: ".feature-extraction",
    content: "We will now extract the area of Trondheim municipality from the Trøndelag county boundary.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: ".input-layer",
    content: "First, select the 'trondelag' layer from this dropdown.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: ".rows-per-page",
    content: "Next, set the number of rows per page to 50 to see all features at once.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: ".scroll-table",
    content: "Scroll down to find the row which contains 'Trondheim - Tråante' in the 'kommmunenavn' column.",  
    disableBeacon: true,
    placement: "top",
  },
  {
    target:".select-trondheim-checkbox",
    content: "Select the corresponding checkbox of Trondheim. (Hint: it should be the last row.)",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".save-btn",
    content: "Finally, click 'Save' to create a new layer with the extracted feature.",
    disableBeacon: true,
    placement: "top",
  }
]

export const FEATURE_EXTRACTOR_STEPS_2: Step[] = [
  {
    target: ".feature-extraction",
    content: "We will now extract shallow water areas from the depth layer.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: ".input-layer",
    content: "Select the 'trondheim-depth' layer as the input layer.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: "[data-testid='select-field']",
    content: "Select the 'maksimumsdybde' field from this dropdown.",
    disableBeacon: true,
    placement: "left", 
  },
  {
    target: "[data-testid='operator-select']",
    content: "Choose the '<=' (less than or equal to) operator.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: "[data-testid='value-input']",
    content: "Type '5' in this value field to filter for shallow water areas.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: "[data-testid='add-filter-btn']",
    content: "Click 'Add Filter' to apply the filter condition.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target:".select-all-checkbox",
    content: "Now select all features by clicking the checkbox in the header row.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".remove-input-feature-extract-layer",
    content: "Uncheck this box to remove the original depth layer after extraction.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".save-btn",
    content: "Click 'Save' to create a new layer with the extracted shallow water areas.",
    disableBeacon: true,
    placement: "top",
  }
]

    

export const CLIP_STEPS: Step[] = [
  {
    target: ".clip-input-layer",
    content: "Select 'swimming-spots' and 'AIS' as input.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".clip-clip-layer",
    content: "Select the 'trondheim' layer as the clip layer.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: ".clip-styles",
    content: "Adjust the styles for the clipped layers. Try to set 100% opacity and a bright color for the swimming spots layer to make them stand out.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: ".remove-input-layer",
    content: "Since you will not need the original layers anymore, uncheck this box to remove them after clipping.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".clip-btn",
    content: "Click to clip the layers.",
    disableBeacon: true,
    placement: "left",
  },
]

export const DISSOLVE_STEPS: Step[] = [
  {
    target: ".dissolve-tool",
    content: "We will now dissolve the depth layer to simplify it.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: ".dissolve-input-layer",
    content: "Select the extracted trondheim-depth layer as the input layer.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".dissolve-field",
    content: "Keep this field unselected to dissolve all features into one.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".dissolve-form",
    content: "Name the new layer 'shallow-water' and set a light blue color.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".remove-input-layer",
    content: "Uncheck this box to remove the original layer after dissolving.",
    disableBeacon: true,
    placement: "left",  
  },
  {
    target: ".dissolve-btn",
    content: "Click save to dissolve the layer. This will take a few seconds.",
    disableBeacon: true,
    placement: "left",    
  },
]

export const BUFFER_STEPS: Step[] = [
  {
    target: ".buffer-tool",
    content: "We will now create a buffer around the AIS data to avoid areas with heavy boat/ship traffic.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: ".buffer-input-layer",
    content: "Select the clipped AIS layer as the input layer.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".buffer-distance",
    content: "Set the buffer distance to 300 meters.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: ".buffer-form",
    content: "Name the new layer 'traffic' and make it red.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: ".remove-input-layer",
    content: "Uncheck this box to remove the original AIS layer after creating the buffer.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".buffer-btn",
    content: "Click save to create the buffer.",
    disableBeacon: true,
    placement: "left",
  }
]

export const DIFFERENCE_STEPS: Step[] = [
  {
    target: ".difference-tool",
    content: "We will now find suitable kayaking areas by subtracting the trafficated areas from the shallow water areas.",
    disableBeacon: true,
    placement: "center",
  },
  {
    target: ".difference-base-layer",
    content: "Select the 'shallow-water' layer as the base input layer.",
    disableBeacon: true,
    placement: "left",
  },
  {
    target: ".difference-subtract-layer",
    content: "Select the 'traffic' layer as the layer to subtract.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: ".difference-styles",
    content: "Name the new layer 'kayaking-areas', make it green and set a 20% opacity.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: ".difference-btn",
    content: "Click to create the difference layer. This will take a few seconds.",
    disableBeacon: true,
    placement: "left",
  },
]

// Add this to your tutorial steps file
export const ROUTE_DRAWING_STEPS: Step[] = [
  {
    target: ".map-container", // or whatever your map container class is
    content: "Click on a desired swimming spot to start your line. Then move the cursor and continue clicking to add points along your desired path through the shallow, safe areas."
    + " To finish a line, double-click or press 'Enter' on your keyboard.",
    disableBeacon: true,
    placement: "center",
  },
  // {
  //   target: ".map-container",
  //   content: "Try to keep your route within the suitable kayaking areas (avoiding the red traffic zones) and connecting 2-3 swimming spots.",
  //   disableBeacon: true,
  //   placement: "center",
  // },
  {
    target: ".bottom-toolbar", // or wherever your drawing controls appear
    content: "Use these controls while drawing: 'Add another' to create multiple lines, 'Clear all' to restart your drawing, or 'Cancel' to exit drawing mode without saving.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: ".finish-btn", // the check button in your bottom toolbar
    content: "When you're happy with your route, click 'Finish' to save it as a new layer.",
    disableBeacon: true,
    placement: "top",
  },
]

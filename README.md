# 🦈 SharkGIS

**SharkGIS** is a lightweight, fully client-side web application for basic GIS operations in the browser. Built with React, Mapbox GL JS, Zustand and Turf.js, it enables quick and intuitive spatial analysis without the need for installation or backend infrastructure.

This project was developed as part of the course **TBA4251 – Programming in Geomatics** at NTNU.

## 🌍 Try it live

🔗 **App**: [sharkgis.com](https://sharkgis.com)  
💾 **Fallback**: [mortened.github.io/SharkGIS](https://mortened.github.io/SharkGIS)  
🧑‍💻 **Source code**: [github.com/mortened/SharkGIS](https://github.com/mortened/SharkGIS)

> ⚠️ Note: sharkgis.com is a temporary domain and may expire after one year. The fallback link will remain available via GitHub Pages.

---

## 🚀 Features

- Upload GeoJSON files and visualize vector layers
- Perform classic GIS operations (buffer, clip, dissolve, intersect)
- Draw new geometries (points, lines, polygons) directly on the map
- Use a built-in, step-by-step tutorial to learn by doing
- Export results to GeoJSON, GPX or PNG
- All operations happen client-side – no backend needed

---

## 🧠 Motivation

The goal was to create an intuitive, browser-based GIS tool tailored for beginners, with a clean interface and just enough functionality to support core vector operations. It’s designed to be used both as a standalone learning environment and as a hands-on teaching tool in GIS education.

---

## 🧱 Tech Stack

| Tool / Library | Purpose |
|----------------|---------|
| **React** + **Vite** | Component architecture and fast dev server |
| **TypeScript** | Static typing and better DX |
| **Mapbox GL JS** | Fast, interactive map rendering |
| **@mapbox/mapbox-gl-draw** | Custom polygon/line/point drawing |
| **Zustand** | Simple and scalable state management |
| **Turf.js** | Fast geospatial processing in the browser |
| **shadcn/ui** + **Radix UI** | Flexible UI components |
| **react-joyride** | Contextual onboarding & tutorials |
| **Tailwind CSS** | Utility-first styling framework |

---

## 🧭 Example Use Case: Kayak Route Planning

A built-in tutorial guides students through a real-world spatial analysis task: identifying safe kayak routes in Trondheim.

### Steps include:

1. **Clipping** datasets to the Trondheim municipality boundary
2. **Buffering** around ship traffic points (AIS data)
3. **Merging** shallow water areas
4. **Subtracting** restricted zones
5. **Drawing** a route between known swimming spots

All steps are performed interactively in the browser, supported by tooltips and visual guidance.

---
## 🔧 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/mortened/SharkGIS.git
cd SharkGIS
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your `.env` file

Create a `.env` file in the root directory with your Mapbox token:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

> You can get a free token from https://account.mapbox.com

### 4. Start the development server

```bash
npm run dev
```

---

## 👤 Author

**Morten Sandbæk Edvardsen**  
NTNU – Engineering Science and ICT (Geomatics)  
📎 https://github.com/mortened

---

## 🙌 Acknowledgements

- Built as part of TBA4251 – Programming in Geomatics (NTNU)
- Thanks to NTNU and the open source GIS community

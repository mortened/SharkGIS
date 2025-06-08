import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./components/AppSidebar";
import "./App.css";
import Map from "./components/Map";
import TopBar from "./components/TopBar";
import TutorialButtons from "./components/TutorialButtons";
import PhasePointer from "./tutorial/PhasePointer";
import { Toaster } from "sonner";

function App() {
  return (
    <div className="fixed inset-0 w-screen h-screen">
      <SidebarProvider>
        <AppSidebar />
        <Toaster richColors position="top-center" />
        <SidebarTrigger className="relative z-50 hover:bg-white/90" />
        <Map />
        <PhasePointer />
        <TutorialButtons />
        <TopBar />
      </SidebarProvider>
    </div>
  );
}

export default App;

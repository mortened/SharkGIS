import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from './components/AppSidebar'
import './App.css'
import Map from './components/Map'
import NewLayerButton from './components/layers/NewLayerButton'
import ToolBar from './components/tools/ToolBar'

function App() {
  return (
      <div className="fixed inset-0 w-screen h-screen">
      <SidebarProvider>
          <AppSidebar />
          <SidebarTrigger className="relative z-50 hover:bg-white/90" />
          <Map />
          <NewLayerButton />
          <ToolBar />
      </SidebarProvider>
    </div>
  )
}

export default App
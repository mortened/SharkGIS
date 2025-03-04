import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { LayerUploadDialog } from "@/components/layers/LayerUploadDialog"
import { useMapStore } from "@/hooks/useMapstore"

export default function NewLayerButton() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const map = useMapStore(state => state.map)

    return (
        <>
            <Button 
                variant="outline"
                size="icon"
                className="fixed bottom-6 right-6 z-40 rounded-full w-20 h-20 shadow-lg hover:shadow-xl transition-shadow bg-[#a5c7db]"
                onClick={() => setIsDialogOpen(true)}
                disabled={!map}
            >
                <Plus className="h-10 w-10" />
            </Button>
            <LayerUploadDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen}
            />
        </>
    )
} 
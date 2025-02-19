import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewLayerButton() {
    return (
        <Button 
            variant="outline"
            size="icon"
            className="fixed bottom-6 right-6 z-50 rounded-full w-20 h-20 shadow-lg hover:shadow-xl transition-shadow bg-[#a5c7db]"  
            onClick={() => console.log('Add new layer')}  // Add your layer creation logic here
        >
            <Plus className="h-10 w-10" />
        </Button>
    )
}
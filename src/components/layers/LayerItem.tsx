import { useLayers } from "@/hooks/useLayers";
import { Ellipsis, Eye, EyeClosed, Settings, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useState } from "react";
import { LayerSettingsDialog } from "./LayerSettingsDialog";


interface LayerItemProps{
    id: string;
    name: string;
    onDelete: () => void;
    isVisible: boolean;
    onToggleVisibility: () => void;
}

export default function LayerItem({
    id,
    name,
    onDelete,
    isVisible: propIsVisible,
    onToggleVisibility
}: LayerItemProps){
    const { layers, toggleLayer } = useLayers();
    const layer = layers.find(l => l.id === id);
    const isBaseLayer = id === "base";
    const isVisible = isBaseLayer 
    ? propIsVisible
    : layer?.visible ?? true;
    console.log('Layer visibility:', { id, isVisible, layer, data: layer?.data }); // Debug log
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    

    return(
        <div className="flex items-center justify-between px-2 py-1">
            <h3>{name}</h3>
            <div className="flex items-center gap-2 justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="transition-all duration-900 hover:scale-110">
                        <Ellipsis 
                            className="h-5 w-5 cursor-pointer hover:shadow-lg hover:bg-black/10 transition-shadow rounded-full p-0.5" 
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="p-2">
                        <DropdownMenuItem onClick={() => setIsSettingsOpen(true)

                        }>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Layer Settings</span>
                        </DropdownMenuItem>
                        {!isBaseLayer && (
                            <DropdownMenuItem onClick={onDelete}>
                                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                <span className="text-red-500">Delete Layer</span>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
                
                {!isBaseLayer && (
                    <LayerSettingsDialog 
                                key={layer?.id}
                                open={isSettingsOpen} 
                                onOpenChange={setIsSettingsOpen}
                                layer={layer}
                    />
                )}
                
                {isVisible ? (
                    <Eye 
                        className="h-5 w-5 cursor-pointer hover:shadow-lg hover:bg-black/10 transition-shadow duration-900 rounded-full p-0.5 hover:scale-110" 
                        onClick={() => {onToggleVisibility()}}
                    />
                ) : (
                    <EyeClosed 
                        className="h-5 w-5 cursor-pointer hover:shadow-lg hover:bg-black/10 transition-shadow duration-900 rounded-full p-0.5 hover:scale-110" 
                        onClick={() => {onToggleVisibility()}}
                    />
                )}
            </div>
        </div>
    )
}
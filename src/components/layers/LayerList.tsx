import { useLayers } from "@/hooks/useLayers";
import LayerItem from "./LayerItem";

export default function LayerList(){
    const layers = useLayers()


    return(
        <div className="gap-2 p-3">
            <LayerItem id="base" name="Base map" onDelete={() => { } } />
            {layers.layers.map((layer) => (
                <LayerItem key={layer.id} id={layer.id} name={layer.name} onDelete={() => layers.removeLayer(layer.id)} isVisible={true} />
            ))}
        </div>
    )
}
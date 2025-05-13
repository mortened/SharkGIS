import { LayerSettingsForm } from "./LayerSettingsForm";

export interface TempLayer {
  file: File;
  name: string;
  color: string;
  opacity: number;
}

interface MultipleLayerSettingsFormProps {
  layers: TempLayer[];
  onChange: (index: number, patch: Partial<TempLayer>) => void;
}

/** Scrollable stack of `LayerSettingsForm`s – one per uploaded file. */
export function MultipleLayerSettingsForm({
  layers,
  onChange,
}: MultipleLayerSettingsFormProps) {
  return (
    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
      {layers.map((layer, i) => (
        <LayerSettingsForm
          key={layer.file.name}
          layerName={layer.name}
          onNameChange={(name) => onChange(i, { name })}
          fillColor={layer.color}
          onFillColorChange={(color) => onChange(i, { color })}
          fillOpacity={layer.opacity}
          onFillOpacityChange={(opacity) => onChange(i, { opacity })}
        />
      ))}
    </div>
  );
}

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LayerUploadFilesProps {
  /** All files currently selected in the dialog */
  selected: File[];
  /** Called whenever the user adds (or replaces) files */
  onSelect: (files: File[]) => void;
}

export function LayerUploadFiles({
  selected,
  onSelect,
}: LayerUploadFilesProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------- helpers ---------- */
  /** Check if a file is a valid GeoJSON file */
  const isGeoJson = (f: File) =>
    f.type === "application/json" || f.name.toLowerCase().endsWith(".geojson");
  /** Read files from the input or drag-and-drop */
  const readFiles = (fileList: FileList) => {
    const goodFiles = Array.from(fileList).filter(isGeoJson);
    if (goodFiles.length) {
      onSelect([...selected, ...goodFiles]); // ← send complete set
      setErrorMessage(null);
    } else {
      setErrorMessage("Please upload GeoJSON file(s)");
    }
  };

  /* ---------- event handlers ---------- */
  /** Handle drag events to toggle the active state */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };
  /** Handle drop event to read files */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) readFiles(e.dataTransfer.files);
  };
  /** Handle file input change event */
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) readFiles(e.target.files);
  };
  /** Handle deletion of a file from the list */
  const handleDelete = (file: File) => {
    const newFiles = selected.filter((f) => f.name !== file.name);
    onSelect(newFiles);
  };

  /* ---------- render ---------- */

  return (
    <Card
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-secondary border-dashed transition-colors duration-200 ${
        dragActive ? "bg-secondary border-white" : ""
      }`}
    >
      <CardHeader>
        <CardTitle>File upload</CardTitle>
        <CardDescription>
          Drag GeoJSON files here or click the button below
        </CardDescription>
      </CardHeader>

      <CardContent className="min-h-[100px] flex flex-col items-center justify-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.geojson"
          multiple /* ← allow several */
          className="hidden"
          onChange={handleFileInput}
        />

        <Button
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-secondary rounded-xl"
        >
          <Upload className="h-4 w-4" />
          Choose file{selected.length !== 1 && "s"}
        </Button>

        {selected.length > 0 && (
          <ul className="text-sm text-gray-600 space-y-0.5 text-center">
            {selected.map((file) => (
              //   Delete file with red cross icon
              <li key={file.name} className="flex justify-between">
                <span>{file.name}</span>
                <button
                  onClick={() => handleDelete(file)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {errorMessage && (
          <p className="mt-1 text-red-500 text-sm">{errorMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}

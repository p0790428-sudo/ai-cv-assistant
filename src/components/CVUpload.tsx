import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CVUploadProps {
  onFile: (file: File) => void;
  isLoading: boolean;
  fileName?: string | null;
}

export function CVUpload({ onFile, isLoading, fileName }: CVUploadProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files[0]) return;
      const f = files[0];
      if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) return;
      onFile(f);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "group relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all",
        "bg-gradient-card shadow-card hover:border-primary/60 hover:shadow-glow",
        dragging ? "border-primary scale-[1.01]" : "border-border",
        isLoading && "pointer-events-none opacity-80",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow">
        {isLoading ? (
          <Loader2 className="h-7 w-7 animate-spin text-primary-foreground" />
        ) : fileName ? (
          <FileText className="h-7 w-7 text-primary-foreground" />
        ) : (
          <Upload className="h-7 w-7 text-primary-foreground" />
        )}
      </div>
      <h3 className="mt-5 text-lg font-semibold">
        {isLoading ? "Analyzing CV…" : fileName ? fileName : "Drop a PDF here, or click to upload"}
      </h3>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {isLoading
          ? "Extracting skills, experience and scoring the candidate"
          : "PDF only · processed securely · usually takes ~10 seconds"}
      </p>
    </div>
  );
}

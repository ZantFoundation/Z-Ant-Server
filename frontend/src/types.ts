interface DropZoneProps {
    onFileSelect: (file: File | null, errorMessage?: string) => void;
}
  
interface FileInfoProps {
    file: File | null;
}
  
interface ProgressBarProps {
    progress: number;
}

interface StatusMessageProps {
    error: string;
    success: string;
}

export type { DropZoneProps, FileInfoProps, ProgressBarProps, StatusMessageProps };
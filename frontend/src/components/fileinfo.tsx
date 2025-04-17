import { FileInfoProps } from "../types";

const FileInfo: React.FC<FileInfoProps> = ({ file }) => {
  if (!file) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
      <p className="text-gray-700">
        Selected file: <strong>{file.name}</strong>
      </p>
      <p className="text-gray-600 text-sm mt-1">
        Size: {formatFileSize(file.size)}
      </p>
    </div>
  );
};

export default FileInfo;

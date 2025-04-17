import { useState } from "react";
import DropZone from "./components/dropzone";
import FileInfo from "./components/fileinfo";
import ProgressBar from "./components/progressbar";
import StatusMessage from "./components/statusmessage";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [downloadReady, setDownloadReady] = useState<boolean>(false);
  const [generatedId, setGeneratedId] = useState<string>("");

  const handleFileSelect = (
    selectedFile: File | null,
    errorMessage: string = ""
  ): void => {
    if (errorMessage) {
      setError(errorMessage);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
    setSuccess("");
    setDownloadReady(false);
    setGeneratedId("");
  };

  const resetUploader = (): void => {
    setFile(null);
    setProgress(0);
    setDownloadReady(false);
    setGeneratedId("");
  };

  const generateCode = async (): Promise<void> => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    // Create FormData
    const formData = new FormData();
    formData.append("model", file);

    // Reset states
    setError("");
    setSuccess("");
    setUploading(true);
    setProgress(0);
    setDownloadReady(false);

    try {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      });

      // Promise wrapper for XHR
      const response = await new Promise<string>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(new Error(xhr.statusText || "Server Error"));
          }
        };

        xhr.onerror = () => reject(new Error("Network Error"));
        xhr.onabort = () => reject(new Error("Upload Aborted"));

        xhr.responseType = "text";
        xhr.open("POST", "https://127.0.0.1/api/codegen", true);
        xhr.send(formData);
      });

      // Parse the JSON response
      const responseData = JSON.parse(response);

      if (responseData.id) {
        setGeneratedId(responseData.id);
        setDownloadReady(true);
        setSuccess(
          responseData.message ||
            "Model processed successfully! Ready for download."
        );
        setProgress(100);
      } else {
        throw new Error("No ID received from server");
      }
    } catch (err) {
      console.error("Generation failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Generation failed: ${errorMessage}`);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const downloadProcessedFile = (): void => {
    if (!generatedId) {
      setError("No processed file available for download");
      return;
    }

    // Create download URL with the generated ID
    const downloadUrl = `https://127.0.0.1/api/codegen?id=${generatedId}`;

    // Create and trigger download link
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = file
      ? file.name.replace(".onnx", ".zip")
      : "generated-code.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Show success message
    setSuccess("Download initiated!");

    // Reset uploader after delay
    setTimeout(() => {
      resetUploader();
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-amber-500">
          Zant Codegen
        </h1>

        <div className="mb-6">
          <DropZone onFileSelect={handleFileSelect} />
          {file && <FileInfo file={file} />}
        </div>

        <div className="flex flex-col space-y-4">
          <button
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              file && !uploading
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!file || uploading}
            onClick={generateCode}
          >
            {uploading ? "Processing..." : "Generate Code"}
          </button>

          <button
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              downloadReady
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!downloadReady}
            onClick={downloadProcessedFile}
          >
            Download Code
          </button>
        </div>

        <div className="mt-6">
          {(uploading || progress > 0) && <ProgressBar progress={progress} />}
          <StatusMessage error={error} success={success} />
        </div>
      </div>
    </div>
  );
}

export default App;

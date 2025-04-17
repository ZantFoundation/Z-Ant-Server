import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import {DropZoneProps} from '../types';

const DropZone: React.FC<DropZoneProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files[0]);
    }
  };

  const handleFiles = (file: File): void => {
    if (!file.name.endsWith('.onnx')) {
      onFileSelect(null, 'Only .onnx files are accepted');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    onFileSelect(file);
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragOver ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-500'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <label className="flex flex-col items-center cursor-pointer">
        <div className="text-4xl mb-4 text-amber-500">📁</div>
        <div>
          <strong className="block text-gray-800">Select your ONNX model</strong>
          <p className="text-gray-600 mt-1">Drag & drop your file here or click to browse</p>
          <p className="text-gray-500 text-sm mt-1">Only .onnx files accepted</p>
        </div>
      </label>
      <input 
        ref={fileInputRef}
        type="file" 
        className="hidden" 
        accept=".onnx" 
        onChange={handleFileInputChange}
      />
    </div>
  );
};

export default DropZone;
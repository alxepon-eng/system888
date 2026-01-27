import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: FileData | null) => void;
  maxSizeMB?: number;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  onFileSelect, 
  maxSizeMB = 10,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`ขนาดไฟล์ต้องไม่เกิน ${maxSizeMB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/png;base64,") to get raw base64
      const base64Content = base64String.split(',')[1];
      
      const fileData: FileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        base64: base64Content
      };

      setFileName(file.name);
      onFileSelect(fileData);

      if (file.type.startsWith('image/')) {
        setPreview(base64String);
      } else {
        setPreview(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-gray-800 font-bold ml-1">{label}</label>
      
      <div 
        className={`relative border-2 border-dashed border-gray-400 rounded-xl p-6 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer ${error ? 'border-red-500 bg-red-50' : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept={accept}
          onChange={handleFileChange}
        />

        {fileName ? (
          <div className="flex flex-col items-center gap-2">
            {preview ? (
              <img src={preview} alt="Preview" className="h-32 object-contain rounded-lg border-2 border-black neo-brutalism-sm" />
            ) : (
              <FileText size={48} className="text-pink-500" />
            )}
            <p className="text-sm font-medium text-gray-700 text-center break-all">{fileName}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); clearFile(); }}
              className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold hover:bg-red-200 flex items-center gap-1"
            >
              <X size={12} /> ลบไฟล์
            </button>
          </div>
        ) : (
          <>
            <Upload size={32} className="text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm text-center">คลิกเพื่อเลือกไฟล์</p>
            <p className="text-gray-400 text-xs text-center mt-1">รองรับ PDF, รูปภาพ, Word, Excel (ไม่เกิน {maxSizeMB}MB)</p>
          </>
        )}
      </div>
      {error && <span className="text-red-500 text-sm ml-1">{error}</span>}
    </div>
  );
};
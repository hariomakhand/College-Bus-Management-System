import React, { useState } from 'react';
import { Upload, X, File, Image, CheckCircle, AlertCircle } from 'lucide-react';

const FileUpload = ({ 
  onUpload, 
  multiple = false, 
  accept = "image/*,application/pdf,.doc,.docx",
  maxSize = 5, // MB
  folder = "bus-management",
  className = ""
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size: ${maxSize}MB`);
        return false;
      }
      return true;
    });

    if (multiple) {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      
      if (multiple) {
        files.forEach(file => {
          formData.append('files', file);
        });
        formData.append('folder', folder);

        const response = await fetch('http://localhost:5001/api/upload/multiple', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const result = await response.json();
        if (result.success) {
          onUpload(result.data);
          setFiles([]);
        } else {
          throw new Error(result.message);
        }
      } else {
        formData.append('file', files[0]);
        formData.append('folder', folder);

        const response = await fetch('http://localhost:5001/api/upload/single', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        const result = await response.json();
        if (result.success) {
          onUpload(result.data);
          setFiles([]);
        } else {
          throw new Error(result.message);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <Image className="text-blue-500" size={20} />;
    }
    return <File className="text-gray-500" size={20} />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {multiple ? 'Multiple files allowed' : 'Single file only'} • Max {maxSize}MB each
        </p>
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
        >
          <Upload size={16} className="mr-2" />
          Choose Files
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">Selected Files:</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={uploadFiles}
          disabled={uploading}
          className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle size={16} className="mr-2" />
              Upload {files.length} File{files.length > 1 ? 's' : ''}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default FileUpload;
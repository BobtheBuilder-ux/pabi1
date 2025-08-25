import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Upload, 
  File, 
  Image, 
  X, 
  Download, 
  Eye, 
  FileText,
  Music,
  Video,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface FileSharingProps {
  conversationId: string;
  onFileUpload?: (files: FileItem[]) => void;
  onFileDownload?: (file: FileItem) => void;
  className?: string;
}

/**
 * FileSharing component that handles file and image uploads/downloads in conversations
 * Supports drag & drop, file preview, and various file types
 */
export const FileSharing: React.FC<FileSharingProps> = ({
  conversationId,
  onFileUpload,
  onFileDownload,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'project-proposal.pdf',
      size: 2048000,
      type: 'application/pdf',
      url: '/mock-files/project-proposal.pdf',
      uploadedAt: new Date('2024-01-15T10:30:00'),
      uploadedBy: 'Pacific'
    },
    {
      id: '2',
      name: 'design-mockup.png',
      size: 1024000,
      type: 'image/png',
      url: '/mock-files/design-mockup.png',
      uploadedAt: new Date('2024-01-14T15:45:00'),
      uploadedBy: 'current-user'
    },
    {
      id: '3',
      name: 'meeting-notes.docx',
      size: 512000,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      url: '/mock-files/meeting-notes.docx',
      uploadedAt: new Date('2024-01-13T09:15:00'),
      uploadedBy: 'Pacific'
    }
  ]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Formats file size to human readable format
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Gets appropriate icon for file type
   */
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.startsWith('audio/')) return Music;
    if (type.includes('pdf')) return FileText;
    if (type.includes('zip') || type.includes('rar')) return Archive;
    return File;
  };

  /**
   * Handles drag events
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handles file drop
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  /**
   * Handles file selection
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  /**
   * Processes selected files
   */
  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  /**
   * Uploads selected files
   */
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      // Mock upload process
      const newFiles: FileItem[] = selectedFiles.map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // In real app, this would be the server URL
        uploadedAt: new Date(),
        uploadedBy: 'current-user'
      }));

      setUploadedFiles(prev => [...newFiles, ...prev]);
      setSelectedFiles([]);
      
      if (onFileUpload) {
        onFileUpload(newFiles);
      }

      toast.success(`${newFiles.length} file(s) uploaded successfully!`);
    } catch (error) {
      toast.error('Failed to upload files. Please try again.');
    }
  };

  /**
   * Removes a selected file before upload
   */
  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handles file download
   */
  const handleDownload = (file: FileItem) => {
    // Mock download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onFileDownload) {
      onFileDownload(file);
    }
    
    toast.success(`Downloading ${file.name}`);
  };

  /**
   * Handles file preview
   */
  const handlePreview = (file: FileItem) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setPreviewFile(file);
    } else {
      toast.info('Preview not available for this file type');
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={`flex items-center space-x-2 ${className}`}
      >
        <Upload className="h-4 w-4" />
        <span>Share Files</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>File Sharing</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Upload Area */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Upload Files</h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop files here, or click to select
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Maximum file size: 10MB
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="mx-auto"
                >
                  Select Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedFiles.map((file, index) => {
                      const Icon = getFileIcon(file.type);
                      return (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSelectedFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  <Button onClick={handleUpload} className="w-full">
                    Upload {selectedFiles.length} File(s)
                  </Button>
                </div>
              )}
            </div>

            {/* Uploaded Files */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Shared Files ({uploadedFiles.length})</h3>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {uploadedFiles.map((file) => {
                    const Icon = getFileIcon(file.type);
                    return (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Icon className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(file.size)} • Uploaded by {file.uploadedBy} • {file.uploadedAt.toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {(file.type.startsWith('image/') || file.type === 'application/pdf') && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(file)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      {previewFile && (
        <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{previewFile.name}</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              {previewFile.type.startsWith('image/') ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[70vh]"
                  title={previewFile.name}
                />
              ) : (
                <p>Preview not available</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FolderPlus, List, Grid, Folder } from "lucide-react";
import FileItem from "./FileItem";
import { toast } from "sonner";
import { Link } from 'react-router-dom';
import { getFiles, uploadFile } from "@/lib/api";

type FileItemType = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified?: string;
};

const FileExplorer = () => {
  const [items, setItems] = useState<FileItemType[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const files = await getFiles(currentPath);
      setItems(files);
    };

    fetchData();
  }, [currentPath]);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      
      const newFiles = [];
      for (const file of Array.from(e.target.files)) {
        const uploadedFile = await uploadFile(file, currentPath);
        newFiles.push(uploadedFile);
      }
        
      setItems([...items, ...newFiles]);
      setIsUploading(false);
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
    }
  };
  
  const createFolder = () => {
    const folderName = prompt("Enter folder name");
    if (folderName) {
      const newFolder = {
        id: Date.now().toString(),
        name: folderName,
        type: 'folder' as const
      };
      setItems([...items, newFolder]);
      toast.success(`Folder "${folderName}" created`);
    }
  };
  
  const handleItemClick = (item: typeof items[0]) => {
    if (item.type === 'folder') {
      setCurrentPath([...currentPath, item.name]);
    }
  };
  
  const handleDownload = (item: typeof items[0]) => {
    toast.success(`Downloading ${item.name}...`);
  };
  
  const handleDelete = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    toast.success(`Item deleted`);
  };
  
  const navigateToPath = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b">
        <div>
          <div className="flex items-center space-x-1 text-sm mb-2 sm:mb-0">
            <Link to="/">
            <button 
              onClick={() => setCurrentPath([])}
              className="text-brand-purple hover:underline font-medium"
            >
              Home
              
            </button>
            </Link>
            {currentPath.map((path, index) => (
              <div key={index} className="flex items-center">
                <span className="mx-1 text-gray-400">/</span>
                <button 
                  onClick={() => navigateToPath(index)}
                  className="text-brand-purple hover:underline font-medium"
                >
                  {path}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="bg-brand-purple hover:bg-brand-purple-dark flex-1 sm:flex-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <input 
            id="file-upload" 
            type="file" 
            multiple 
            className="hidden" 
            onChange={handleFileUpload} 
          />
          <Button onClick={createFolder} variant="outline" className="flex-1 sm:flex-auto">
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isUploading ? (
        <div className="flex flex-col items-center justify-center p-10 animate-pulse">
          <div className="h-10 w-10 rounded-full bg-brand-purple mb-4"></div>
          <p className="text-gray-500">Uploading files...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10">
          <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Folder className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No files yet</h3>
          <p className="text-gray-500 text-center max-w-md mt-1">
            Upload files or create folders to get started
          </p>
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            className="mt-4 bg-brand-purple hover:bg-brand-purple-dark"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
        </div>
      ) : (
        <div className={`flex-1 p-4 overflow-y-auto ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4' : 'space-y-2'}`}>
          {items.map((item) => (
            <FileItem
              key={item.id}
              name={item.name}
              type={item.type}
              size={item.size}
              modified={item.modified}
              onClick={() => handleItemClick(item)}
              onDownload={() => handleDownload(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;

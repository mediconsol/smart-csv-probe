import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      onFileSelect(csvFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <Card 
      className={cn(
        "border-2 border-dashed transition-all duration-300 shadow-card",
        isDragOver 
          ? "border-primary bg-primary/5 shadow-glow" 
          : "border-muted-foreground/25 hover:border-primary/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-primary">
          <Upload className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2">CSV 파일 업로드</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          CSV 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요. 
          최대 100MB까지 지원됩니다.
        </p>
        
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="default" 
            className="bg-gradient-primary shadow-glow"
            disabled={isLoading}
            onClick={() => document.getElementById('csv-input')?.click()}
          >
            <FileText className="w-4 h-4 mr-2" />
            {isLoading ? '업로드 중...' : '파일 선택'}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <span>CSV 형식만 지원됩니다</span>
        </div>
        
        <input
          id="csv-input"
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileInput}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
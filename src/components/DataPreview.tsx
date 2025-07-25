import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, BarChart3, TrendingUp, Settings } from 'lucide-react';
import { ColumnManager } from './ColumnManager';

interface Column {
  name: string;
  type: 'string' | 'number' | 'date';
  samples: string[];
}

interface DataPreviewProps {
  columns: Column[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName: string;
  onColumnTypeChange?: (columnName: string, newType: string, convertedData?: any[]) => void;
}

export function DataPreview({ columns, rows, totalRows, fileName, onColumnTypeChange }: DataPreviewProps) {
  const getTypeColor = (type: Column['type']) => {
    switch (type) {
      case 'number': return 'bg-data-blue text-white';
      case 'date': return 'bg-data-orange text-white';
      default: return 'bg-data-teal text-white';
    }
  };

  const getTypeIcon = (type: Column['type']) => {
    switch (type) {
      case 'number': return <BarChart3 className="w-3 h-3" />;
      case 'date': return <TrendingUp className="w-3 h-3" />;
      default: return <Database className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 파일 정보 */}
      <Card className="shadow-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            데이터 개요
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-data">
              <div className="text-2xl font-bold text-white">{totalRows.toLocaleString()}</div>
              <div className="text-sm text-white/80">총 행 수</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-chart">
              <div className="text-2xl font-bold text-white">{columns.length}</div>
              <div className="text-sm text-white/80">총 열 수</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-primary">
              <div className="text-sm font-semibold text-white truncate">{fileName}</div>
              <div className="text-xs text-white/80">파일명</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 구조로 변경 */}
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis">
            <Database className="w-4 h-4 mr-2" />
            컬럼 분석
          </TabsTrigger>
          <TabsTrigger value="management">
            <Settings className="w-4 h-4 mr-2" />
            컬럼 관리
          </TabsTrigger>
          <TabsTrigger value="preview">
            <BarChart3 className="w-4 h-4 mr-2" />
            데이터 미리보기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>컬럼 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns.map((column, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium truncate">{column.name}</h4>
                      <Badge className={getTypeColor(column.type)}>
                        {getTypeIcon(column.type)}
                        <span className="ml-1">{column.type}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="font-medium mb-1">샘플 값:</div>
                      {column.samples.slice(0, 3).map((sample, idx) => (
                        <div key={idx} className="truncate text-xs bg-muted/30 px-2 py-1 rounded mb-1">
                          {sample || '(빈 값)'}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management">
          {onColumnTypeChange && (
            <ColumnManager 
              columns={columns}
              onColumnTypeChange={onColumnTypeChange}
              sampleData={rows}
            />
          )}
        </TabsContent>

        <TabsContent value="preview">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>데이터 미리보기 (처음 10행)</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column, index) => (
                          <TableHead key={index} className="font-semibold">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(column.type)}
                              {column.name}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.slice(0, 10).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {columns.map((column, colIndex) => (
                            <TableCell key={colIndex} className="max-w-[200px] truncate">
                              {row[column.name] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
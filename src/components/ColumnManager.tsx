import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Settings, Type, Hash, Calendar, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColumnManagerProps {
  columns: Array<{name: string; type: string}>;
  onColumnTypeChange: (columnName: string, newType: string, convertedData?: any[]) => void;
  sampleData: any[];
}

interface ConversionResult {
  success: number;
  failed: number;
  samples: any[];
}

const COLUMN_TYPES = [
  { value: 'string', label: '텍스트', icon: <Type className="w-4 h-4" />, description: '문자열 데이터' },
  { value: 'number', label: '숫자', icon: <Hash className="w-4 h-4" />, description: '정수 또는 소수' },
  { value: 'date', label: '날짜', icon: <Calendar className="w-4 h-4" />, description: '날짜/시간 데이터' },
  { value: 'boolean', label: '불린', icon: <CheckCircle className="w-4 h-4" />, description: 'true/false 값' }
];

export function ColumnManager({ columns, onColumnTypeChange, sampleData }: ColumnManagerProps) {
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const { toast } = useToast();

  const convertColumnData = (columnName: string, targetType: string, data: any[]): ConversionResult => {
    let success = 0;
    let failed = 0;
    const samples: any[] = [];
    
    const convertedData = data.map((row, index) => {
      const originalValue = row[columnName];
      let convertedValue = originalValue;
      let conversionSuccess = true;

      try {
        switch (targetType) {
          case 'number':
            if (originalValue === null || originalValue === undefined || originalValue === '') {
              convertedValue = null;
            } else {
              const numValue = parseFloat(String(originalValue).replace(/[^0-9.-]/g, ''));
              convertedValue = isNaN(numValue) ? null : numValue;
              if (convertedValue === null) conversionSuccess = false;
            }
            break;
            
          case 'string':
            convertedValue = originalValue === null || originalValue === undefined ? '' : String(originalValue);
            break;
            
          case 'date':
            if (originalValue === null || originalValue === undefined || originalValue === '') {
              convertedValue = null;
            } else {
              const dateValue = new Date(originalValue);
              convertedValue = isNaN(dateValue.getTime()) ? null : dateValue.toISOString().split('T')[0];
              if (convertedValue === null) conversionSuccess = false;
            }
            break;
            
          case 'boolean':
            if (originalValue === null || originalValue === undefined || originalValue === '') {
              convertedValue = null;
            } else {
              const strValue = String(originalValue).toLowerCase();
              if (['true', '1', 'yes', 'y', '참'].includes(strValue)) {
                convertedValue = true;
              } else if (['false', '0', 'no', 'n', '거짓'].includes(strValue)) {
                convertedValue = false;
              } else {
                convertedValue = null;
                conversionSuccess = false;
              }
            }
            break;
            
          default:
            convertedValue = originalValue;
        }

        if (conversionSuccess) {
          success++;
        } else {
          failed++;
        }

        // 샘플 데이터 수집 (처음 5개)
        if (samples.length < 5) {
          samples.push({
            index,
            original: originalValue,
            converted: convertedValue,
            success: conversionSuccess
          });
        }

        return { ...row, [columnName]: convertedValue };
      } catch (error) {
        failed++;
        if (samples.length < 5) {
          samples.push({
            index,
            original: originalValue,
            converted: null,
            success: false
          });
        }
        return { ...row, [columnName]: null };
      }
    });

    return { success, failed, samples };
  };

  const handlePreviewConversion = async () => {
    if (!selectedColumn || !selectedType) return;

    setIsConverting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 시뮬레이션
      
      const result = convertColumnData(selectedColumn, selectedType, sampleData);
      setConversionResult(result);
      setPreviewDialogOpen(true);

      toast({
        title: "변환 미리보기 완료",
        description: `${result.success}개 성공, ${result.failed}개 실패`,
      });
    } catch (error) {
      toast({
        title: "변환 오류",
        description: "데이터 변환 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleApplyConversion = () => {
    if (!selectedColumn || !selectedType || !conversionResult) return;

    // 전체 데이터 변환
    const result = convertColumnData(selectedColumn, selectedType, sampleData);
    
    // 부모 컴포넌트에 변경 사항 전달
    onColumnTypeChange(selectedColumn, selectedType, sampleData.map((row, index) => 
      result.samples.find(s => s.index === index)?.success !== false ? 
        { ...row, [selectedColumn]: result.samples.find(s => s.index === index)?.converted ?? row[selectedColumn] } : 
        row
    ));

    setPreviewDialogOpen(false);
    setConversionResult(null);
    setSelectedColumn('');
    setSelectedType('');

    toast({
      title: "컬럼 타입 변경 완료",
      description: `${selectedColumn} 컬럼이 ${COLUMN_TYPES.find(t => t.value === selectedType)?.label}(으)로 변경되었습니다.`,
    });
  };

  const resetSelection = () => {
    setSelectedColumn('');
    setSelectedType('');
    setConversionResult(null);
  };

  const currentColumn = columns.find(col => col.name === selectedColumn);
  const targetTypeInfo = COLUMN_TYPES.find(t => t.value === selectedType);

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            컬럼 타입 관리
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>변경할 컬럼</Label>
              <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="컬럼 선택" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.name} value={column.name}>
                      <div className="flex items-center gap-2">
                        {column.name}
                        <Badge variant="outline" className="text-xs">
                          {COLUMN_TYPES.find(t => t.value === column.type)?.label || column.type}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>변경할 타입</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {COLUMN_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.icon}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handlePreviewConversion}
                disabled={!selectedColumn || !selectedType || isConverting}
                className="w-full bg-gradient-primary shadow-glow"
              >
                {isConverting ? '변환 중...' : '미리보기'}
              </Button>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline"
                onClick={resetSelection}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                초기화
              </Button>
            </div>
          </div>

          {selectedColumn && selectedType && (
            <div className="mt-4 p-4 rounded-lg bg-muted/30">
              <h4 className="font-medium mb-2">변환 정보</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">현재 타입: </span>
                  <Badge variant="outline">
                    {COLUMN_TYPES.find(t => t.value === currentColumn?.type)?.label || currentColumn?.type}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">변경 후 타입: </span>
                  <Badge variant="outline" className="bg-primary/10">
                    {targetTypeInfo?.label}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {targetTypeInfo?.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 현재 컬럼 정보 테이블 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>컬럼 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>컬럼명</TableHead>
                  <TableHead>현재 타입</TableHead>
                  <TableHead>샘플 데이터</TableHead>
                  <TableHead>빈 값 개수</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columns.map((column, index) => {
                  const sampleValues = sampleData.slice(0, 3).map(row => row[column.name]).filter(v => v !== null && v !== undefined && v !== '');
                  const emptyCount = sampleData.filter(row => row[column.name] === null || row[column.name] === undefined || row[column.name] === '').length;
                  
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{column.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {COLUMN_TYPES.find(t => t.value === column.type)?.label || column.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {sampleValues.slice(0, 2).map(val => String(val)).join(', ')}
                        {sampleValues.length > 2 && '...'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={emptyCount > 0 ? "destructive" : "secondary"}>
                          {emptyCount}개
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 변환 미리보기 다이얼로그 */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>변환 미리보기</DialogTitle>
          </DialogHeader>
          
          {conversionResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{conversionResult.success}</div>
                    <div className="text-sm text-muted-foreground">성공</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{conversionResult.failed}</div>
                    <div className="text-sm text-muted-foreground">실패</div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-medium mb-2">변환 샘플</h4>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>원본 값</TableHead>
                        <TableHead>변환 값</TableHead>
                        <TableHead>상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conversionResult.samples.map((sample, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{String(sample.original)}</TableCell>
                          <TableCell className="font-mono">{String(sample.converted)}</TableCell>
                          <TableCell>
                            {sample.success ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleApplyConversion} className="bg-gradient-primary">
                  적용하기
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
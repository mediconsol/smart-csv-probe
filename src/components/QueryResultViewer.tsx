import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Copy, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QueryResultViewerProps {
  queryResult: any[];
  originalQuery: string;
}

export function QueryResultViewer({ queryResult, originalQuery }: QueryResultViewerProps) {
  const { toast } = useToast();

  // 결과 데이터에서 컬럼 추출
  const getColumns = () => {
    if (queryResult.length === 0) return [];
    return Object.keys(queryResult[0]);
  };

  // 데이터 타입 추정
  const getDataType = (value: any): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
      // 날짜 형식 체크
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
      // 숫자 형식 체크
      if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
      return 'string';
    }
    return 'string';
  };

  // 값 포맷팅
  const formatValue = (value: any, type: string): string => {
    if (value === null || value === undefined) return '-';
    if (type === 'number' && typeof value === 'number') {
      return value.toLocaleString();
    }
    if (type === 'date') {
      try {
        return new Date(value).toLocaleDateString('ko-KR');
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  // CSV 내보내기
  const exportToCSV = () => {
    if (queryResult.length === 0) return;

    const columns = getColumns();
    const csvContent = [
      columns.join(','),
      ...queryResult.map(row => 
        columns.map(col => {
          const value = row[col];
          // CSV에서 특수 문자 처리
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `query_result_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "CSV 내보내기 완료",
      description: "쿼리 결과가 CSV 파일로 다운로드되었습니다.",
    });
  };

  // 쿼리 복사
  const copyQuery = () => {
    navigator.clipboard.writeText(originalQuery);
    toast({
      title: "쿼리 복사됨",
      description: "SQL 쿼리가 클립보드에 복사되었습니다.",
    });
  };

  const columns = getColumns();
  
  if (queryResult.length === 0) {
    return (
      <Card className="shadow-card">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">쿼리 결과가 없습니다</p>
            <p className="text-sm">
              쿼리를 실행하거나 다른 조건으로 다시 시도해보세요.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>쿼리 결과</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {queryResult.length.toLocaleString()}개 행
              </Badge>
              <Badge variant="outline">
                {columns.length}개 컬럼
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyQuery}>
              <Copy className="w-4 h-4 mr-2" />
              쿼리 복사
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              CSV 내보내기
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* 쿼리 정보 */}
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">실행된 쿼리:</p>
          <code className="text-xs bg-muted p-1 rounded">
            {originalQuery.length > 100 ? originalQuery.substring(0, 100) + '...' : originalQuery}
          </code>
        </div>

        {/* 테이블 */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  {columns.map((column) => {
                    const sampleValue = queryResult[0][column];
                    const dataType = getDataType(sampleValue);
                    return (
                      <TableHead key={column} className="min-w-[120px]">
                        <div className="flex flex-col">
                          <span className="font-medium">{column}</span>
                          <Badge variant="secondary" className="text-xs w-fit mt-1">
                            {dataType}
                          </Badge>
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResult.slice(0, 1000).map((row, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                    <TableCell className="text-center text-muted-foreground text-sm">
                      {index + 1}
                    </TableCell>
                    {columns.map((column) => {
                      const value = row[column];
                      const dataType = getDataType(value);
                      return (
                        <TableCell key={column} className="font-mono text-sm">
                          <div className="max-w-[200px] truncate" title={String(value)}>
                            {formatValue(value, dataType)}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {queryResult.length > 1000 && (
            <div className="p-3 bg-muted/30 text-center text-sm text-muted-foreground">
              성능을 위해 상위 1,000개 행만 표시됩니다. 
              전체 데이터는 CSV로 내보내기를 이용하세요.
            </div>
          )}
        </div>

        {/* 요약 통계 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{queryResult.length}</div>
            <div className="text-xs text-blue-600">총 행 수</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{columns.length}</div>
            <div className="text-xs text-green-600">컬럼 수</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {columns.filter(col => getDataType(queryResult[0][col]) === 'number').length}
            </div>
            <div className="text-xs text-purple-600">숫자 컬럼</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {columns.filter(col => getDataType(queryResult[0][col]) === 'string').length}
            </div>
            <div className="text-xs text-orange-600">텍스트 컬럼</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
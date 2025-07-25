import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Download, RefreshCw, Calculator, PieChart, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SummaryReportProps {
  data: {
    columns: Array<{name: string; type: string}>;
    rows: any[];
    totalRows: number;
  };
}

interface SummaryData {
  groupBy: string;
  values: Array<{
    category: string;
    count: number;
    sum: number;
    avg: number;
    percentage: number;
  }>;
}

export function SummaryReport({ data }: SummaryReportProps) {
  const [selectedGroupColumn, setSelectedGroupColumn] = useState<string>('');
  const [selectedValueColumn, setSelectedValueColumn] = useState<string>('');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const textColumns = data.columns.filter(col => col.type === 'string' || col.type === 'text');
  const numericColumns = data.columns.filter(col => col.type === 'number' || col.type === 'numeric');

  const calculateSummary = async () => {
    if (!selectedGroupColumn) {
      toast({
        title: "그룹 컬럼을 선택해주세요",
        description: "항목별 분류를 위한 컬럼을 선택해야 합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 계산 시뮬레이션
      
      // 데이터 그룹화 및 집계
      const grouped = data.rows.reduce((acc, row) => {
        const category = row[selectedGroupColumn] || '미분류';
        const value = selectedValueColumn && selectedValueColumn !== 'count_only' ? parseFloat(row[selectedValueColumn]) || 0 : 1;
        
        if (!acc[category]) {
          acc[category] = {
            count: 0,
            sum: 0,
            values: []
          };
        }
        
        acc[category].count += 1;
        acc[category].sum += value;
        acc[category].values.push(value);
        
        return acc;
      }, {} as Record<string, any>);

      // 총합 계산
      const totalSum = Object.values(grouped).reduce((sum: number, group: any) => sum + group.sum, 0);

      // 결과 정리
      const summaryValues = Object.entries(grouped).map(([category, group]: [string, any]) => ({
        category,
        count: group.count,
        sum: group.sum,
        avg: group.sum / group.count,
        percentage: totalSum > 0 ? (group.sum / totalSum) * 100 : 0
      })).sort((a, b) => b.sum - a.sum);

      setSummaryData({
        groupBy: selectedGroupColumn,
        values: summaryValues
      });

      toast({
        title: "집계 완료",
        description: `${summaryValues.length}개 항목의 합계가 계산되었습니다.`,
      });

    } catch (error) {
      toast({
        title: "계산 오류",
        description: "데이터 집계 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const exportToCSV = () => {
    if (!summaryData) return;

    const csvContent = [
      ['항목', '건수', '합계', '평균', '비율(%)'].join(','),
      ...summaryData.values.map(item => [
        item.category,
        item.count,
        item.sum.toFixed(2),
        item.avg.toFixed(2),
        item.percentage.toFixed(1)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${summaryData.groupBy}_summary_report.csv`;
    link.click();

    toast({
      title: "내보내기 완료",
      description: "합계 보고서가 CSV 파일로 다운로드되었습니다.",
    });
  };

  const totalSum = summaryData?.values.reduce((sum, item) => sum + item.sum, 0) || 0;
  const totalCount = summaryData?.values.reduce((sum, item) => sum + item.count, 0) || 0;

  return (
    <div className="space-y-6">
      {/* 설정 패널 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            항목별 합계 보고서 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">그룹 기준 컬럼 *</label>
              <Select value={selectedGroupColumn} onValueChange={setSelectedGroupColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="분류 기준 선택" />
                </SelectTrigger>
                <SelectContent>
                  {textColumns.map((column) => (
                    <SelectItem key={column.name} value={column.name}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">합계 대상 컬럼</label>
              <Select value={selectedValueColumn} onValueChange={setSelectedValueColumn}>
                <SelectTrigger>
                  <SelectValue placeholder="합계할 컬럼 선택 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count_only">건수만 계산</SelectItem>
                  {numericColumns.map((column) => (
                    <SelectItem key={column.name} value={column.name}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={calculateSummary}
                disabled={isCalculating || !selectedGroupColumn}
                className="w-full bg-gradient-primary shadow-glow"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
                {isCalculating ? '계산 중...' : '집계 실행'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {summaryData && (
        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table">
              <BarChart3 className="w-4 h-4 mr-2" />
              테이블 보기
            </TabsTrigger>
            <TabsTrigger value="chart">
              <PieChart className="w-4 h-4 mr-2" />
              차트 보기
            </TabsTrigger>
            <TabsTrigger value="statistics">
              <TrendingUp className="w-4 h-4 mr-2" />
              통계 요약
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {summaryData.groupBy}별 합계 보고서
                  </CardTitle>
                  <Button variant="outline" onClick={exportToCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV 내보내기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>항목</TableHead>
                        <TableHead className="text-right">건수</TableHead>
                        {selectedValueColumn && selectedValueColumn !== 'count_only' && (
                          <>
                            <TableHead className="text-right">합계</TableHead>
                            <TableHead className="text-right">평균</TableHead>
                          </>
                        )}
                        <TableHead className="text-right">비율</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData.values.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.category}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{item.count.toLocaleString()}</Badge>
                          </TableCell>
                          {selectedValueColumn && selectedValueColumn !== 'count_only' && (
                            <>
                              <TableCell className="text-right font-mono">
                                {item.sum.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                {item.avg.toFixed(2)}
                              </TableCell>
                            </>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-primary h-2 rounded-full"
                                  style={{ width: `${item.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-mono">
                                {item.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chart">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>항목별 분포 차트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">차트 구현 예정</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{summaryData.values.length}</div>
                    <div className="text-sm text-muted-foreground">총 항목 수</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">총 건수</div>
                  </div>
                </CardContent>
              </Card>

              {selectedValueColumn && selectedValueColumn !== 'count_only' && (
                <Card className="shadow-card">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{totalSum.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">총 합계</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
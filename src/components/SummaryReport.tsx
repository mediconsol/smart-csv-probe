import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartVisualization } from '@/components/ChartVisualization';
import { ComboChartVisualization } from '@/components/ComboChartVisualization';
import { BarChart3, Download, RefreshCw, Calculator, PieChart, TrendingUp, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SummaryReportProps {
  data: {
    columns: Array<{name: string; type: string}>;
    rows: any[];
    totalRows: number;
  };
  onSummaryDataChange?: (summaryData: any[] | null) => void;
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

export function SummaryReport({ data, onSummaryDataChange }: SummaryReportProps) {
  const [selectedGroupColumns, setSelectedGroupColumns] = useState<string[]>([]);
  const [selectedValueColumns, setSelectedValueColumns] = useState<string[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  const textColumns = data.columns.filter(col => col.type === 'string' || col.type === 'text');
  const numericColumns = data.columns.filter(col => col.type === 'number' || col.type === 'numeric');

  // 체크박스 핸들러
  const handleGroupColumnChange = (columnName: string, checked: boolean) => {
    if (checked) {
      setSelectedGroupColumns(prev => [...prev, columnName]);
    } else {
      setSelectedGroupColumns(prev => prev.filter(col => col !== columnName));
    }
  };

  const handleValueColumnChange = (columnName: string, checked: boolean) => {
    if (checked) {
      setSelectedValueColumns(prev => [...prev, columnName]);
    } else {
      setSelectedValueColumns(prev => prev.filter(col => col !== columnName));
    }
  };

  const calculateSummary = async () => {
    if (selectedGroupColumns.length === 0) {
      toast({
        title: "그룹 컬럼을 선택해주세요",
        description: "항목별 분류를 위한 컬럼을 최소 1개 선택해야 합니다.",
        variant: "destructive"
      });
      return;
    }

    if (data.rows.length === 0) {
      toast({
        title: "데이터가 없습니다",
        description: "분석할 데이터가 없습니다. 먼저 CSV 파일을 업로드해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 계산 시뮬레이션
      
      // 다중 컬럼 그룹화
      const grouped = data.rows.reduce((acc, row) => {
        // 다중 그룹 키 생성 (예: "서울|개발팀")
        const groupKey = selectedGroupColumns
          .map(col => String(row[col] || '미분류'))
          .join(' | ');
        
        if (!acc[groupKey]) {
          acc[groupKey] = {
            count: 0,
            columnValues: {}, // 각 값 컬럼별 합계
            groupDetails: selectedGroupColumns.map(col => ({
              column: col,
              value: String(row[col] || '미분류')
            }))
          };
          
          // 값 컬럼 초기화
          selectedValueColumns.forEach(col => {
            acc[groupKey].columnValues[col] = {
              sum: 0,
              values: []
            };
          });
        }
        
        acc[groupKey].count += 1;
        
        // 각 값 컬럼별 집계
        selectedValueColumns.forEach(col => {
          const rawValue = row[col];
          let value = 0;
          
          if (rawValue !== null && rawValue !== undefined && rawValue !== '') {
            const numericValue = Number(rawValue);
            if (!isNaN(numericValue) && isFinite(numericValue)) {
              value = numericValue;
            }
          }
          
          acc[groupKey].columnValues[col].sum += value;
          acc[groupKey].columnValues[col].values.push(value);
        });
        
        return acc;
      }, {} as Record<string, any>);

      // 결과 정리
      const summaryValues = Object.entries(grouped).map(([groupKey, group]: [string, any]) => {
        const result: any = {
          category: groupKey,
          count: group.count,
          groupDetails: group.groupDetails
        };

        // 각 값 컬럼별 통계 추가
        if (selectedValueColumns.length > 0) {
          selectedValueColumns.forEach(col => {
            const colData = group.columnValues[col];
            result[`${col}_sum`] = colData.sum;
            result[`${col}_avg`] = group.count > 0 ? colData.sum / group.count : 0;
          });
          
          // 주요 값 (첫 번째 값 컬럼의 합계)
          const primaryCol = selectedValueColumns[0];
          result.sum = group.columnValues[primaryCol]?.sum || group.count;
          result.avg = group.count > 0 ? result.sum / group.count : 0;
        } else {
          // 값 컬럼이 없으면 건수만
          result.sum = group.count;
          result.avg = 1;
        }

        return result;
      });

      // 백분율 계산
      const totalSum = summaryValues.reduce((sum, item) => sum + item.sum, 0);
      summaryValues.forEach(item => {
        item.percentage = totalSum > 0 ? (item.sum / totalSum) * 100 : 0;
      });

      // 정렬 (합계 기준)
      summaryValues.sort((a, b) => b.sum - a.sum);

      const newSummaryData = {
        groupBy: selectedGroupColumns.join(' + '),
        values: summaryValues
      };

      setSummaryData(newSummaryData);
      
      // 부모 컴포넌트에 데이터 전달
      if (onSummaryDataChange) {
        onSummaryDataChange(summaryValues);
      }

      toast({
        title: "집계 완료",
        description: `${summaryValues.length}개 항목의 합계가 계산되었습니다. (그룹: ${selectedGroupColumns.length}개, 값: ${selectedValueColumns.length}개)`,
      });

    } catch (error) {
      console.error('Summary calculation error:', error);
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

    // 헤더 생성
    const headers = ['항목', '건수'];
    selectedValueColumns.forEach(col => {
      headers.push(`${col} 합계`, `${col} 평균`);
    });
    headers.push('비율(%)');

    // 데이터 행 생성
    const csvContent = [
      headers.join(','),
      ...summaryData.values.map(item => {
        const row = [item.category, item.count];
        selectedValueColumns.forEach(col => {
          row.push(
            (item[`${col}_sum`] || 0).toFixed(2),
            (item[`${col}_avg`] || 0).toFixed(2)
          );
        });
        row.push(item.percentage.toFixed(1));
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${summaryData.groupBy.replace(/[^a-zA-Z0-9]/g, '_')}_summary_report.csv`;
    link.click();

    toast({
      title: "내보내기 완료",
      description: "다중 컬럼 합계 보고서가 CSV 파일로 다운로드되었습니다.",
    });
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 그룹 기준 컬럼 선택 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">그룹 기준 컬럼 *</label>
                <Badge variant="outline" className="text-xs">
                  {selectedGroupColumns.length}개 선택됨
                </Badge>
              </div>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                {textColumns.length > 0 ? (
                  <div className="space-y-2">
                    {textColumns.map((column) => (
                      <div key={column.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`group-${column.name}`}
                          checked={selectedGroupColumns.includes(column.name)}
                          onCheckedChange={(checked) => 
                            handleGroupColumnChange(column.name, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`group-${column.name}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {column.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({column.type})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    텍스트 컬럼이 없습니다
                  </div>
                )}
              </div>
            </div>

            {/* 합계 대상 컬럼 선택 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">합계 대상 컬럼 (선택사항)</label>
                <Badge variant="outline" className="text-xs">
                  {selectedValueColumns.length}개 선택됨
                </Badge>
              </div>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                {numericColumns.length > 0 ? (
                  <div className="space-y-2">
                    {numericColumns.map((column) => (
                      <div key={column.name} className="flex items-center space-x-2">
                        <Checkbox
                          id={`value-${column.name}`}
                          checked={selectedValueColumns.includes(column.name)}
                          onCheckedChange={(checked) => 
                            handleValueColumnChange(column.name, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`value-${column.name}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {column.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({column.type})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    숫자 컬럼이 없습니다
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 실행 버튼 */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedGroupColumns.length > 0 && (
                <span>
                  📊 <strong>{selectedGroupColumns.join(' + ')}</strong>별로 분류
                  {selectedValueColumns.length > 0 && (
                    <span>, <strong>{selectedValueColumns.join(' + ')}</strong> 집계</span>
                  )}
                </span>
              )}
            </div>
            <Button 
              onClick={calculateSummary}
              disabled={isCalculating || selectedGroupColumns.length === 0}
              className="bg-gradient-primary shadow-glow"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isCalculating ? 'animate-spin' : ''}`} />
              {isCalculating ? '계산 중...' : '집계 실행'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {summaryData && (
        <Tabs defaultValue="table" className="w-full">
          <TabsList className={`grid w-full ${selectedValueColumns.length >= 2 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="table">
              <BarChart3 className="w-4 h-4 mr-2" />
              테이블 보기
            </TabsTrigger>
            <TabsTrigger value="chart">
              <PieChart className="w-4 h-4 mr-2" />
              차트 보기
            </TabsTrigger>
            {selectedValueColumns.length >= 2 && (
              <TabsTrigger value="combo">
                <Activity className="w-4 h-4 mr-2" />
                콤보 차트
              </TabsTrigger>
            )}
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
                        {selectedValueColumns.map(col => (
                          <TableHead key={`${col}_sum`} className="text-right">
                            {col} 합계
                          </TableHead>
                        ))}
                        {selectedValueColumns.map(col => (
                          <TableHead key={`${col}_avg`} className="text-right">
                            {col} 평균
                          </TableHead>
                        ))}
                        <TableHead className="text-right">비율</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {summaryData.values.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="space-y-1">
                              <div>{item.category}</div>
                              {item.groupDetails && item.groupDetails.length > 1 && (
                                <div className="text-xs text-muted-foreground">
                                  {item.groupDetails.map((detail: any, i: number) => (
                                    <div key={i}>
                                      {detail.column}: {detail.value}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{item.count.toLocaleString()}</Badge>
                          </TableCell>
                          {selectedValueColumns.map(col => (
                            <TableCell key={`${col}_sum`} className="text-right font-mono">
                              {item[`${col}_sum`]?.toLocaleString() || '0'}
                            </TableCell>
                          ))}
                          {selectedValueColumns.map(col => (
                            <TableCell key={`${col}_avg`} className="text-right font-mono">
                              {item[`${col}_avg`]?.toFixed(2) || '0.00'}
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-gradient-primary h-2 rounded-full"
                                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
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
            <ChartVisualization 
              data={summaryData.values.map(item => ({
                name: item.category,
                value: selectedValueColumns.length > 0 ? item.sum : item.count,
                count: item.count,
                avg: item.avg,
                percentage: item.percentage
              }))}
              title={`${summaryData.groupBy}별 ${selectedValueColumns.length > 0 ? `${selectedValueColumns[0]} 합계` : '건수'} 분포`}
            />
          </TabsContent>

          {selectedValueColumns.length >= 2 && (
            <TabsContent value="combo">
              <ComboChartVisualization
                data={summaryData.values.map(item => ({
                  name: item.category,
                  ...item
                }))}
                title={`${summaryData.groupBy}별 다중 컬럼 콤보 분석`}
                valueColumns={selectedValueColumns}
              />
            </TabsContent>
          )}

          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {selectedValueColumns.map(col => {
                const columnTotal = summaryData.values.reduce((sum, item) => sum + (item[`${col}_sum`] || 0), 0);
                return (
                  <Card key={col} className="shadow-card">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{columnTotal.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{col} 총합</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {selectedGroupColumns.length > 1 && (
                <Card className="shadow-card lg:col-span-full">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary mb-2">다중 그룹 분석</div>
                      <div className="text-sm text-muted-foreground">
                        <strong>{selectedGroupColumns.join(' × ')}</strong>로 교차 분석
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedGroupColumns.length}개 차원으로 데이터를 분류하여 세밀한 분석 제공
                      </div>
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
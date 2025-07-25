import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { QueryBuilder } from '@/components/QueryBuilder';
import { ChartVisualization } from '@/components/ChartVisualization';
import { QueryResultViewer } from '@/components/QueryResultViewer';
import { SummaryReport } from '@/components/SummaryReport';
import { DataPrivacyNotice } from '@/components/DataPrivacyNotice';
import { Footer } from '@/components/Footer';
import { AIInsights } from '@/components/AIInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MediconsolLogo } from '@/components/ui/icons/MediconsolLogo';
import { Sparkles, Database, BarChart3, Search, FileText, Calculator } from 'lucide-react';
import { parseCSVFile, generateSampleData, executeQuery, ParsedData } from '@/utils/csvProcessor';
import { transformQueryResultToChartData, generateChartTitle } from '@/utils/chartDataTransformer';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [data, setData] = useState<ParsedData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [lastExecutedQuery, setLastExecutedQuery] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [summaryData, setSummaryData] = useState<any[] | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedData = await parseCSVFile(file);
      setData(parsedData);
      setFileName(file.name);
      toast({
        title: "파일 업로드 완료",
        description: `${file.name} 파일이 성공적으로 분석되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "파일 처리 오류",
        description: "CSV 파일 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteQuery = async (query: string) => {
    if (!data) return;
    
    setIsExecuting(true);
    try {
      // 실제 SQL 쿼리 실행
      const result = await executeQuery(data, query);
      setQueryResult(result);
      setLastExecutedQuery(query);
      
      toast({
        title: "쿼리 실행 완료",
        description: `${result.length}개의 결과를 반환했습니다.`,
      });
    } catch (error) {
      console.error('Query execution error:', error);
      toast({
        title: "쿼리 실행 오류",
        description: error instanceof Error ? error.message : "쿼리 실행 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setQueryResult([]);
      setLastExecutedQuery('');
    } finally {
      setIsExecuting(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = generateSampleData();
    setData(sampleData);
    setFileName('sample-data.csv');
    toast({
      title: "샘플 데이터 로드",
      description: "데모용 샘플 데이터가 로드되었습니다.",
    });
  };

  const handleColumnTypeChange = (columnName: string, newType: string, convertedData?: any[]) => {
    if (!data) return;

    // 컬럼 타입 업데이트
    const updatedColumns = data.columns.map(col => 
      col.name === columnName ? { ...col, type: newType } : col
    );

    // 데이터 업데이트 (변환된 데이터가 있으면 사용)
    const updatedData = {
      ...data,
      columns: updatedColumns,
      rows: convertedData || data.rows
    };

    setData(updatedData);
  };

  // 차트 데이터 우선순위: 합계 보고서 -> 쿼리 결과 -> 기본 데이터
  const getChartData = () => {
    if (summaryData && summaryData.length > 0) {
      // 합계 보고서 데이터를 차트 형식으로 변환
      return summaryData.map(item => ({
        name: item.category || item.name,
        value: item.sum || item.count || item.value,
        count: item.count,
        avg: item.avg,
        percentage: item.percentage
      }));
    }
    
    if (queryResult.length > 0 && queryResult[0].name) {
      return queryResult;
    }
    
    // 기본 데이터 (샘플)
    return data?.rows.slice(0, 10).map((row, index) => ({
      name: row.name || `항목 ${index + 1}`,
      value: parseInt(row.salary) || Math.random() * 1000
    })) || [];
  };

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MediconsolLogo size={48} />
              <div>
                <h1 className="text-2xl font-bold">메디콘솔</h1>
                <p className="text-sm text-muted-foreground">의료 데이터 분석 플랫폼 • mediconsol.co.kr</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={loadSampleData}
              className="hover:bg-gradient-data hover:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              샘플 데이터 체험
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 page-transition">
        {!data ? (
          /* 초기 화면 */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <MediconsolLogo size={80} />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                의료 데이터 분석의 새로운 표준
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                메디콘솔과 함께 의료 데이터를 쉽고 빠르게 분석하세요. 
                CSV 파일을 업로드하여 즉시 인사이트를 발견하고, AI 도움을 받아 더 깊이있는 분석이 가능합니다.
              </p>
            </div>

            {/* 기능 소개 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="shadow-card card-hover fade-in">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-data flex items-center justify-center parallax-slow">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">의료 데이터 전문 분석</h3>
                  <p className="text-sm text-muted-foreground">
                    환자 데이터, 진료 기록, 임상시험 결과 등 다양한 의료 데이터를 안전하고 정확하게 분석합니다
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card card-hover fade-in" style={{animationDelay: '0.2s'}}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-chart flex items-center justify-center parallax-slow">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">직관적 시각화</h3>
                  <p className="text-sm text-muted-foreground">
                    의료진이 이해하기 쉬운 차트와 그래프로 진료 패턴과 트렌드를 명확하게 제시합니다
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card card-hover fade-in" style={{animationDelay: '0.4s'}}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center parallax-slow">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">고급 분석 도구</h3>
                  <p className="text-sm text-muted-foreground">
                    SQL 쿼리와 AI 분석으로 임상 데이터에서 의미있는 인사이트를 추출합니다
                  </p>
                </CardContent>
              </Card>
            </div>

            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        ) : (
          /* 메인 분석 화면 */
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                데이터 개요
              </TabsTrigger>
              <TabsTrigger value="query" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                쿼리 분석
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                합계 보고서
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                시각화
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI 인사이트
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <DataPreview 
                columns={data.columns}
                rows={data.rows}
                totalRows={data.totalRows}
                fileName={fileName}
                onColumnTypeChange={handleColumnTypeChange}
              />
            </TabsContent>

            <TabsContent value="query">
              <QueryBuilder 
                columns={data.columns}
                onExecuteQuery={handleExecuteQuery}
                isExecuting={isExecuting}
              />
              
              {(queryResult.length > 0 || isExecuting) && (
                <div className="mt-6 space-y-6">
                  {isExecuting ? (
                    <Card className="shadow-card">
                      <CardContent className="p-8 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <p className="text-muted-foreground">쿼리를 실행하고 있습니다...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Tabs defaultValue="table" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="table">
                          <Database className="w-4 h-4 mr-2" />
                          테이블 보기
                        </TabsTrigger>
                        <TabsTrigger value="chart">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          차트 보기
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="table">
                        <QueryResultViewer 
                          queryResult={queryResult}
                          originalQuery={lastExecutedQuery}
                        />
                      </TabsContent>

                      <TabsContent value="chart">
                        <ChartVisualization 
                          data={transformQueryResultToChartData(queryResult)}
                          title={generateChartTitle(queryResult, lastExecutedQuery)}
                        />
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="summary">
              <SummaryReport 
                data={data} 
                onSummaryDataChange={setSummaryData}
              />
            </TabsContent>

            <TabsContent value="charts">
              <ChartVisualization 
                data={chartData}
                title={summaryData ? "합계 보고서 시각화" : "데이터 시각화"}
              />
            </TabsContent>

            <TabsContent value="insights">
              <AIInsights data={data} />
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <DataPrivacyNotice />
      <Footer />
    </div>
  );
};

export default Index;
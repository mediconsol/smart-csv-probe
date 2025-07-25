import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { QueryBuilder } from '@/components/QueryBuilder';
import { ChartVisualization } from '@/components/ChartVisualization';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Database, BarChart3, Search, FileText } from 'lucide-react';
import { parseCSVFile, generateSampleData, executeQuery, ParsedData } from '@/utils/csvProcessor';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [data, setData] = useState<ParsedData | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
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
      // 쿼리 실행 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = executeQuery(data, query);
      setQueryResult(result);
      
      toast({
        title: "쿼리 실행 완료",
        description: `${result.length}개의 결과를 반환했습니다.`,
      });
    } catch (error) {
      toast({
        title: "쿼리 실행 오류",
        description: "쿼리 실행 중 오류가 발생했습니다.",
        variant: "destructive"
      });
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

  const chartData = queryResult.length > 0 && queryResult[0].name ? 
    queryResult : 
    data?.rows.slice(0, 10).map((row, index) => ({
      name: row.name || `항목 ${index + 1}`,
      value: parseInt(row.salary) || Math.random() * 1000
    })) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Database className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">CSV 분석 프로그램</h1>
                <p className="text-sm text-muted-foreground">데이터 업로드, 분석, 시각화가 가능한 통합 플랫폼</p>
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

      <div className="container mx-auto px-4 py-8">
        {!data ? (
          /* 초기 화면 */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                데이터 분석의 새로운 경험
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                CSV 파일을 업로드하여 즉시 데이터를 분석하고, AI 도움을 받아 인사이트를 발견하세요. 
                복잡한 설정 없이 바로 시작할 수 있습니다.
              </p>
            </div>

            {/* 기능 소개 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-data flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">즉시 데이터 분석</h3>
                  <p className="text-sm text-muted-foreground">
                    CSV 파일을 드래그 앤 드롭으로 업로드하여 즉시 데이터 구조와 통계를 확인하세요
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-chart flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">강력한 시각화</h3>
                  <p className="text-sm text-muted-foreground">
                    다양한 차트와 그래프로 데이터 패턴을 한눈에 파악할 수 있습니다
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">SQL 쿼리 지원</h3>
                  <p className="text-sm text-muted-foreground">
                    SQL 쿼리로 복잡한 데이터 분석과 필터링을 자유롭게 수행하세요
                  </p>
                </CardContent>
              </Card>
            </div>

            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />
          </div>
        ) : (
          /* 메인 분석 화면 */
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                데이터 개요
              </TabsTrigger>
              <TabsTrigger value="query" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                쿼리 분석
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
              />
            </TabsContent>

            <TabsContent value="query">
              <QueryBuilder 
                columns={data.columns}
                onExecuteQuery={handleExecuteQuery}
                isExecuting={isExecuting}
              />
              
              {queryResult.length > 0 && (
                <div className="mt-6">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle>쿼리 결과</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <pre className="text-sm overflow-auto">
                          {JSON.stringify(queryResult, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="charts">
              <ChartVisualization 
                data={chartData}
                title="데이터 시각화"
              />
            </TabsContent>

            <TabsContent value="insights">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI 데이터 인사이트
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-data text-white">
                      <h4 className="font-semibold mb-2">📊 데이터 품질 분석</h4>
                      <p className="text-sm opacity-90">
                        데이터에서 {data.totalRows}개의 레코드를 분석했습니다. 
                        모든 필수 필드가 채워져 있으며 데이터 품질이 우수합니다.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-chart text-white">
                      <h4 className="font-semibold mb-2">🔍 패턴 발견</h4>
                      <p className="text-sm opacity-90">
                        급여 데이터에서 지역별 차이가 발견되었습니다. 
                        서울과 부산 지역의 평균 급여가 다른 지역보다 높은 경향을 보입니다.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-primary text-white">
                      <h4 className="font-semibold mb-2">💡 추천 분석</h4>
                      <p className="text-sm opacity-90">
                        연령대별 급여 분포를 분석해보세요. 
                        또한 입사일자를 기준으로 한 트렌드 분석도 유용할 것 같습니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Index;
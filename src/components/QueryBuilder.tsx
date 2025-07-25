import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Sparkles, Database, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QueryBuilderProps {
  columns: Array<{name: string; type: string}>;
  onExecuteQuery: (query: string) => void;
  isExecuting?: boolean;
}

export function QueryBuilder({ columns, onExecuteQuery, isExecuting }: QueryBuilderProps) {
  const [query, setQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const { toast } = useToast();

  const queryTemplates = [
    {
      id: 'basic_stats',
      name: '기본 통계',
      icon: <Database className="w-4 h-4" />,
      description: '데이터의 기본 통계 정보를 조회합니다',
      query: `SELECT 
  COUNT(*) as total_rows,
  COUNT(DISTINCT column_name) as unique_values
FROM data;`
    },
    {
      id: 'chart_amount_sum',
      name: '차트번호별 금액 합계',
      icon: <TrendingUp className="w-4 h-4" />,
      description: '차트번호별로 금액의 합계를 구합니다',
      query: `SELECT 
  chart_number,
  SUM(amount) as total_amount,
  COUNT(*) as record_count
FROM data 
GROUP BY chart_number 
ORDER BY total_amount DESC;`
    },
    {
      id: 'top_values',
      name: '상위 값 조회',
      icon: <TrendingUp className="w-4 h-4" />,
      description: '특정 컬럼의 상위 값들을 조회합니다',
      query: `SELECT column_name, COUNT(*) as count
FROM data 
GROUP BY column_name 
ORDER BY count DESC 
LIMIT 10;`
    },
    {
      id: 'date_analysis',
      name: '시간별 분석',
      icon: <Clock className="w-4 h-4" />,
      description: '날짜/시간 컬럼의 패턴을 분석합니다',
      query: `SELECT 
  DATE_TRUNC('day', date_column) as date,
  COUNT(*) as daily_count,
  AVG(numeric_column) as daily_avg
FROM data 
GROUP BY DATE_TRUNC('day', date_column) 
ORDER BY date;`
    },
    {
      id: 'outliers',
      name: '이상치 탐지',
      icon: <AlertTriangle className="w-4 h-4" />,
      description: '통계적 이상치를 탐지합니다',
      query: `WITH stats AS (
  SELECT 
    AVG(numeric_column) as mean,
    STDDEV(numeric_column) as std
  FROM data
)
SELECT * FROM data, stats 
WHERE ABS(numeric_column - mean) > 2 * std;`
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    const template = queryTemplates.find(t => t.id === templateId);
    if (template) {
      setQuery(template.query);
      setSelectedTemplate(templateId);
    }
  };

  const handleExecute = () => {
    if (!query.trim()) {
      toast({
        title: "쿼리를 입력해주세요",
        description: "실행할 SQL 쿼리를 입력하거나 템플릿을 선택하세요.",
        variant: "destructive"
      });
      return;
    }
    onExecuteQuery(query);
  };

  const handleAIAssist = () => {
    toast({
      title: "AI 도움말",
      description: "AI가 데이터를 분석하여 유용한 쿼리를 제안합니다.",
    });
    // AI 분석 로직 구현
  };

  return (
    <div className="space-y-6">
      {/* 쿼리 템플릿 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            쿼리 템플릿
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queryTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-primary bg-primary/5 shadow-glow'
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-gradient-data text-white">
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 컬럼 정보 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>사용 가능한 컬럼</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {columns.map((column, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setQuery(prev => prev + column.name + ' ')}
              >
                {column.name}
                <span className="ml-1 text-xs opacity-60">({column.type})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 쿼리 편집기 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>SQL 쿼리 편집기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SQL 쿼리를 입력하거나 위의 템플릿을 선택하세요..."
            className="min-h-[200px] font-mono text-sm"
          />
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleExecute}
              disabled={isExecuting}
              className="bg-gradient-primary shadow-glow"
            >
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? '실행 중...' : '쿼리 실행'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleAIAssist}
              className="hover:bg-gradient-chart hover:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI 도움말
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
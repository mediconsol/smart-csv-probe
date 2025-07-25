import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Loader2, RefreshCw, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ParsedData } from '@/utils/csvProcessor';

interface AIInsightsProps {
  data: ParsedData;
}

interface InsightItem {
  type: 'trend' | 'anomaly' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export function AIInsights({ data }: AIInsightsProps) {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  // 데이터 기본 통계 생성
  const generateDataStatistics = () => {
    const stats = {
      totalRows: data.totalRows,
      columnCount: data.columns.length,
      numericColumns: data.columns.filter(col => col.type === 'number').length,
      textColumns: data.columns.filter(col => col.type === 'string').length,
      dateColumns: data.columns.filter(col => col.type === 'date').length,
      missingValues: 0,
      duplicateRows: 0
    };

    // 결측값 계산
    data.rows.forEach(row => {
      Object.values(row).forEach(value => {
        if (!value || value.toString().trim() === '') {
          stats.missingValues++;
        }
      });
    });

    // 중복행 계산 (간단한 방법)
    const uniqueRows = new Set(data.rows.map(row => JSON.stringify(row)));
    stats.duplicateRows = data.totalRows - uniqueRows.size;

    return stats;
  };

  // 숫자 컬럼 분석
  const analyzeNumericColumns = () => {
    const numericAnalysis: any = {};
    
    data.columns.filter(col => col.type === 'number').forEach(col => {
      const values = data.rows
        .map(row => parseFloat(row[col.name]))
        .filter(val => !isNaN(val));
      
      if (values.length > 0) {
        const sorted = values.sort((a, b) => a - b);
        numericAnalysis[col.name] = {
          min: Math.min(...values),
          max: Math.max(...values),
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          median: sorted[Math.floor(sorted.length / 2)],
          stdDev: 0 // 간단화를 위해 생략
        };
      }
    });

    return numericAnalysis;
  };

  // 텍스트 컬럼 분포 분석
  const analyzeTextColumns = () => {
    const textAnalysis: any = {};
    
    data.columns.filter(col => col.type === 'string').forEach(col => {
      const distribution: { [key: string]: number } = {};
      data.rows.forEach(row => {
        const value = row[col.name] || '(빈 값)';
        distribution[value] = (distribution[value] || 0) + 1;
      });
      
      const entries = Object.entries(distribution).sort(([,a], [,b]) => b - a);
      textAnalysis[col.name] = {
        uniqueValues: entries.length,
        mostCommon: entries.slice(0, 3),
        distribution
      };
    });

    return textAnalysis;
  };

  // AI 인사이트 생성
  const generateAIInsights = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const stats = generateDataStatistics();
      const numericAnalysis = analyzeNumericColumns();
      const textAnalysis = analyzeTextColumns();

      const API_KEY = 'AIzaSyB5WT1EgNn-1kAXft5uO6SWK5mjTyumztc';
      
      const dataProfile = `
**데이터 개요:**
- 총 ${stats.totalRows}개 행, ${stats.columnCount}개 컬럼
- 숫자 컬럼: ${stats.numericColumns}개, 텍스트 컬럼: ${stats.textColumns}개, 날짜 컬럼: ${stats.dateColumns}개
- 결측값: ${stats.missingValues}개, 중복행: ${stats.duplicateRows}개

**컬럼 정보:**
${data.columns.map(col => `- ${col.name} (${col.type}): 샘플값 [${col.samples.slice(0, 3).join(', ')}]`).join('\n')}

**숫자 컬럼 통계:**
${Object.entries(numericAnalysis).map(([col, stats]: [string, any]) => 
  `- ${col}: 평균 ${stats.avg.toFixed(2)}, 범위 ${stats.min} ~ ${stats.max}`
).join('\n')}

**텍스트 컬럼 분포:**
${Object.entries(textAnalysis).map(([col, stats]: [string, any]) => 
  `- ${col}: ${stats.uniqueValues}개 고유값, 최빈값 "${stats.mostCommon[0]?.[0]}" (${stats.mostCommon[0]?.[1]}회)`
).join('\n')}
      `;

      const prompt = `
당신은 의료 데이터 분석 전문가입니다. 아래 데이터를 분석하여 의미있는 인사이트를 4개 제공해주세요.

${dataProfile}

**요구사항:**
1. 각 인사이트는 다음 형식의 JSON 배열로 반환하세요:
[
  {
    "type": "trend|anomaly|pattern|recommendation",
    "title": "인사이트 제목 (30자 이내)",
    "description": "상세 설명 (100자 이내)",
    "severity": "low|medium|high",
    "confidence": 0-100 (숫자만)
  }
]

2. 실제 데이터 값을 기반으로 구체적인 분석을 제공하세요
3. 의료 데이터 관점에서 임상적으로 의미있는 인사이트를 도출하세요
4. 데이터 품질 문제나 개선 방안도 포함하세요

JSON 형식만 반환하고 다른 텍스트는 포함하지 마세요.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`AI API 오류: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        let aiResponse = result.candidates[0].content.parts[0].text.trim();
        
        // JSON 추출
        aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
          const aiInsights = JSON.parse(aiResponse);
          if (Array.isArray(aiInsights) && aiInsights.length > 0) {
            setInsights(aiInsights);
            toast({
              title: "AI 인사이트 생성 완료",
              description: `${aiInsights.length}개의 인사이트가 생성되었습니다.`,
            });
          } else {
            throw new Error('올바른 인사이트 형식이 아닙니다.');
          }
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          // Fallback: 기본 인사이트 생성
          generateFallbackInsights(stats, numericAnalysis, textAnalysis);
        }
      } else {
        throw new Error('AI 응답이 올바르지 않습니다.');
      }

    } catch (error) {
      console.error('AI 인사이트 생성 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      
      // Fallback 인사이트 생성
      const stats = generateDataStatistics();
      const numericAnalysis = analyzeNumericColumns();
      const textAnalysis = analyzeTextColumns();
      generateFallbackInsights(stats, numericAnalysis, textAnalysis);
      
    } finally {
      setIsGenerating(false);
    }
  };

  // Fallback 인사이트 생성
  const generateFallbackInsights = (stats: any, numericAnalysis: any, textAnalysis: any) => {
    const fallbackInsights: InsightItem[] = [];

    // 데이터 품질 인사이트
    if (stats.missingValues > 0) {
      fallbackInsights.push({
        type: 'anomaly',
        title: '데이터 품질 개선 필요',
        description: `총 ${stats.missingValues}개의 결측값이 발견되었습니다. 데이터 정제가 필요합니다.`,
        severity: stats.missingValues > stats.totalRows * 0.1 ? 'high' : 'medium',
        confidence: 90
      });
    }

    // 숫자 컬럼 인사이트
    const numericCols = Object.entries(numericAnalysis);
    if (numericCols.length > 0) {
      const [colName, colStats] = numericCols[0] as [string, any];
      fallbackInsights.push({
        type: 'trend',
        title: `${colName} 분포 분석`,
        description: `평균 ${colStats.avg.toFixed(1)}, 범위 ${colStats.min}~${colStats.max}로 분포되어 있습니다.`,
        severity: 'low',
        confidence: 85
      });
    }

    // 텍스트 컬럼 인사이트
    const textCols = Object.entries(textAnalysis);
    if (textCols.length > 0) {
      const [colName, colStats] = textCols[0] as [string, any];
      fallbackInsights.push({
        type: 'pattern',
        title: `${colName} 분포 패턴`,
        description: `${(colStats as any).uniqueValues}개의 고유값 중 "${(colStats as any).mostCommon[0]?.[0]}"이 가장 빈번합니다.`,
        severity: 'low',
        confidence: 80
      });
    }

    // 권장사항
    fallbackInsights.push({
      type: 'recommendation',
      title: '추가 분석 권장',
      description: '시계열 분석, 상관관계 분석, 이상치 탐지를 통해 더 깊은 인사이트를 얻을 수 있습니다.',
      severity: 'medium',
      confidence: 75
    });

    setInsights(fallbackInsights.slice(0, 4));
    toast({
      title: "기본 인사이트 생성",
      description: "AI 분석에 실패하여 기본 인사이트를 제공합니다.",
      variant: "default"
    });
  };

  // 컴포넌트 마운트 시 자동 분석
  useEffect(() => {
    if (data && data.rows.length > 0) {
      generateAIInsights();
    }
  }, [data]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'anomaly': return <AlertTriangle className="w-4 h-4" />;
      case 'pattern': return <BarChart3 className="w-4 h-4" />;
      case 'recommendation': return <CheckCircle className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI 데이터 인사이트
            <Badge variant="outline" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Google AI
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={generateAIInsights}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? '분석 중...' : '새로고침'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">분석 오류</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-muted-foreground">AI가 데이터를 심층 분석하고 있습니다...</p>
            <p className="text-xs text-muted-foreground mt-1">
              {data.totalRows}개 행, {data.columns.length}개 컬럼 분석 중
            </p>
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getTypeIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{insight.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {insight.confidence}% 신뢰도
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              데이터를 분석하여 인사이트를 생성해보세요.
            </p>
          </div>
        )}

        {/* 데이터 요약 정보 */}
        {!isGenerating && data && (
          <div className="mt-6 pt-4 border-t border-border/50">
            <h5 className="text-sm font-medium mb-3">📊 데이터 요약</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center p-2 bg-muted/30 rounded">
                <div className="text-lg font-bold text-primary">{data.totalRows}</div>
                <div className="text-xs text-muted-foreground">총 행 수</div>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <div className="text-lg font-bold text-primary">{data.columns.length}</div>
                <div className="text-xs text-muted-foreground">컬럼 수</div>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <div className="text-lg font-bold text-primary">
                  {data.columns.filter(col => col.type === 'number').length}
                </div>
                <div className="text-xs text-muted-foreground">숫자 컬럼</div>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded">
                <div className="text-lg font-bold text-primary">
                  {data.columns.filter(col => col.type === 'string').length}
                </div>
                <div className="text-xs text-muted-foreground">텍스트 컬럼</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
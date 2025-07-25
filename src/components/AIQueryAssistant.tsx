import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Loader2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIQueryAssistantProps {
  columns: Array<{name: string; type: string}>;
  onQueryGenerated: (query: string) => void;
}

export function AIQueryAssistant({ columns, onQueryGenerated }: AIQueryAssistantProps) {
  const [userRequest, setUserRequest] = useState('');
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const generateQuery = async () => {
    if (!userRequest.trim()) {
      toast({
        title: "요청 내용을 입력해주세요",
        description: "어떤 데이터를 분석하고 싶으신지 설명해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const API_KEY = 'AIzaSyB5WT1EgNn-1kAXft5uO6SWK5mjTyumztc';
      
      // 컬럼 정보를 문자열로 변환
      const columnInfo = columns.map(col => `${col.name} (${col.type})`).join(', ');
      
      const prompt = `
당신은 의료 데이터 분석 전문가입니다. 사용자의 요청에 따라 SQL 쿼리를 생성해주세요.

**데이터 구조:**
테이블명: data
컬럼: ${columnInfo}

**사용자 요청:**
${userRequest}

**지침:**
1. 의료 데이터에 적합한 SQL 쿼리를 작성하세요
2. 컬럼명은 정확히 사용하세요
3. WHERE, GROUP BY, ORDER BY 등을 적절히 활용하세요
4. 집계 함수(COUNT, AVG, SUM 등)를 사용할 때는 의미있는 분석이 되도록 하세요
5. LIMIT을 사용하여 결과를 제한하는 것이 좋습니다
6. 개인정보 보호를 고려하여 민감한 데이터 노출을 피하세요

**응답 형식:**
SQL 쿼리만 반환하세요. 설명이나 다른 텍스트는 포함하지 마세요.
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`AI API 오류: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        let query = data.candidates[0].content.parts[0].text.trim();
        
        // SQL 쿼리에서 마크다운 코드 블록 제거
        query = query.replace(/```sql\n?/g, '').replace(/```\n?/g, '').trim();
        
        setGeneratedQuery(query);
        
        toast({
          title: "AI 쿼리 생성 완료",
          description: "생성된 쿼리를 검토한 후 사용해주세요.",
        });
      } else {
        throw new Error('AI 응답 형식이 올바르지 않습니다.');
      }

    } catch (error) {
      console.error('AI 쿼리 생성 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      
      toast({
        title: "AI 쿼리 생성 실패",
        description: "다시 시도해주시거나 수동으로 쿼리를 작성해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyQuery = () => {
    navigator.clipboard.writeText(generatedQuery);
    toast({
      title: "쿼리 복사됨",
      description: "생성된 쿼리가 클립보드에 복사되었습니다.",
    });
  };

  const useQuery = () => {
    onQueryGenerated(generatedQuery);
    toast({
      title: "쿼리 적용됨",
      description: "생성된 쿼리가 쿼리 편집기에 적용되었습니다.",
    });
  };

  const sampleRequests = [
    "나이가 30세 이상인 환자들의 평균 혈압을 구해주세요",
    "진료과별 환자 수를 많은 순으로 정렬해주세요", 
    "최근 6개월간 입원 환자 현황을 월별로 보여주세요",
    "특정 질병 코드가 있는 환자들의 평균 재원일수를 계산해주세요"
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI 쿼리 도우미
          <Badge variant="outline" className="ml-2">
            <Sparkles className="w-3 h-3 mr-1" />
            Google AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 사용 가능한 컬럼 정보 */}
        <div>
          <h4 className="text-sm font-medium mb-2">사용 가능한 컬럼:</h4>
          <div className="flex flex-wrap gap-1">
            {columns.map((column) => (
              <Badge key={column.name} variant="secondary" className="text-xs">
                {column.name} ({column.type})
              </Badge>
            ))}
          </div>
        </div>

        {/* 샘플 요청 */}
        <div>
          <h4 className="text-sm font-medium mb-2">샘플 요청:</h4>
          <div className="grid grid-cols-1 gap-2">
            {sampleRequests.map((request, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="justify-start text-left h-auto p-2 text-xs"
                onClick={() => setUserRequest(request)}
              >
                💡 {request}
              </Button>
            ))}
          </div>
        </div>

        {/* 사용자 요청 입력 */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            원하는 분석을 자연어로 설명해주세요:
          </label>
          <Textarea
            value={userRequest}
            onChange={(e) => setUserRequest(e.target.value)}
            placeholder="예: 30세 이상 환자들의 평균 나이와 성별 분포를 보여주세요"
            className="min-h-[80px]"
          />
        </div>

        {/* 생성 버튼 */}
        <Button 
          onClick={generateQuery} 
          disabled={isGenerating || !userRequest.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI가 쿼리를 생성 중...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI로 쿼리 생성하기
            </>
          )}
        </Button>

        {/* 에러 표시 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">오류 발생</p>
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* 생성된 쿼리 */}
        {generatedQuery && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">생성된 SQL 쿼리:</span>
            </div>
            
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                <code>{generatedQuery}</code>
              </pre>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyQuery}
                className="absolute top-2 right-2"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={useQuery} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                이 쿼리 사용하기
              </Button>
              <Button variant="outline" onClick={copyQuery}>
                <Copy className="w-4 h-4 mr-2" />
                복사
              </Button>
            </div>
          </div>
        )}

        {/* 주의사항 */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
          <p className="font-medium mb-1">💡 사용 팁:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>구체적이고 명확한 요청일수록 정확한 쿼리가 생성됩니다</li>
            <li>생성된 쿼리는 반드시 검토 후 사용하세요</li>
            <li>개인정보가 포함된 민감한 쿼리는 피해주세요</li>
            <li>복잡한 분석은 단계별로 나누어 요청하세요</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
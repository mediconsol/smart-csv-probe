import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { TrendingUp, BarChart3, Activity, Settings } from 'lucide-react';

interface ComboChartData {
  name: string;
  [key: string]: string | number;
}

interface ComboChartVisualizationProps {
  data: ComboChartData[];
  title?: string;
  valueColumns: string[];
}

export function ComboChartVisualization({ 
  data, 
  title = "콤보 차트", 
  valueColumns 
}: ComboChartVisualizationProps) {
  
  // 시각화 옵션 상태
  const [showSum, setShowSum] = useState(true);
  const [showAvg, setShowAvg] = useState(true);
  const [showReferenceLine, setShowReferenceLine] = useState(true);
  
  // 데이터가 없거나 컬럼이 2개 미만인 경우
  if (!data || data.length === 0 || valueColumns.length < 2) {
    return (
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              콤보 차트를 사용할 수 없습니다
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              콤보 차트는 2개 이상의 값 컬럼이 선택되었을 때 사용할 수 있습니다.
            </p>
            <div className="text-xs text-muted-foreground">
              현재 선택된 값 컬럼: <strong>{valueColumns.length}개</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 통계 계산 (선택된 컬럼만)
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const columnStats = valueColumns.map(column => {
      const sumKey = `${column}_sum`;
      const avgKey = `${column}_avg`;
      
      // 해당 컬럼의 합계 데이터만 수집
      const sumValues = data
        .filter(item => item[sumKey] !== undefined)
        .map(item => Number(item[sumKey] || 0));
      
      // 해당 컬럼의 평균 데이터만 수집  
      const avgValues = data
        .filter(item => item[avgKey] !== undefined)
        .map(item => Number(item[avgKey] || 0));

      const totalSum = sumValues.reduce((acc, val) => acc + val, 0);
      const overallAvg = avgValues.length > 0 ? avgValues.reduce((acc, val) => acc + val, 0) / avgValues.length : 0;
      const maxSum = sumValues.length > 0 ? Math.max(...sumValues) : 0;
      const minSum = sumValues.length > 0 ? Math.min(...sumValues) : 0;

      return {
        column,
        sum: totalSum.toFixed(0),
        avg: overallAvg.toFixed(2),
        max: maxSum.toFixed(0),
        min: minSum.toFixed(0)
      };
    });

    return columnStats;
  }, [data, valueColumns]);

  // 차트 데이터 준비 (선택된 컬럼만)
  const chartData = useMemo(() => {
    return data.slice(0, 15).map(item => {
      const chartItem: any = {
        name: String(item.name || item.category || '미분류')
      };

      // 선택된 값 컬럼만 처리
      valueColumns.forEach(column => {
        const sumKey = `${column}_sum`;
        const avgKey = `${column}_avg`;
        
        // 해당 컬럼의 데이터가 있는지 확인
        if (item[sumKey] !== undefined || item[avgKey] !== undefined) {
          // 합계 데이터 (막대형으로 표시)
          chartItem[`${column}_합계`] = Number(item[sumKey] || 0);
          
          // 평균 데이터 (선형으로 표시)
          chartItem[`${column}_평균`] = Number(item[avgKey] || 0);
        }
      });

      return chartItem;
    });
  }, [data, valueColumns]);

  // 색상 팔레트
  const colors = [
    '#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444',
    '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#84cc16'
  ];

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="flex-1">{entry.dataKey}:</span>
              <span className="font-mono font-semibold">
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 정보 및 설정 */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              {title}
            </CardTitle>
            <div className="flex gap-2">
              {showSum && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  막대형: 합계
                </Badge>
              )}
              {showAvg && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  선형: 평균
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-4">
                📊 <strong>{valueColumns.join(', ')}</strong>의 선택한 항목을 함께 표시합니다.
                {data.length > 15 && (
                  <span className="block mt-1">
                    ⚡ 성능을 위해 상위 15개 항목만 표시됩니다.
                  </span>
                )}
              </div>
            </div>
            
            {/* 시각화 옵션 설정 */}
            <div className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">시각화 옵션</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-sum"
                    checked={showSum}
                    onCheckedChange={(checked) => setShowSum(checked === true)}
                  />
                  <label htmlFor="show-sum" className="text-sm cursor-pointer flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    합계 (막대형)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-avg"
                    checked={showAvg}
                    onCheckedChange={(checked) => setShowAvg(checked === true)}
                  />
                  <label htmlFor="show-avg" className="text-sm cursor-pointer flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    평균 (선형)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-reference"
                    checked={showReferenceLine}
                    onCheckedChange={(checked) => setShowReferenceLine(checked === true)}
                    disabled={!showAvg}
                  />
                  <label htmlFor="show-reference" className="text-sm cursor-pointer">
                    기준선 표시
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 콤보 차트 */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">📈 콤보 차트 시각화</CardTitle>
        </CardHeader>
        <CardContent>
          {!showSum && !showAvg ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                시각화 옵션을 선택해주세요
              </h3>
              <p className="text-sm text-muted-foreground">
                합계 또는 평균 중 하나 이상을 선택하여 차트를 표시하세요.
              </p>
            </div>
          ) : (
            <div className="w-full" style={{ height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                  interval={0}
                />
                {/* Y축 설정 - 옵션에 따라 동적 조정 */}
                {showSum && (
                  <YAxis 
                    yAxisId="bar"
                    orientation="left"
                    fontSize={12}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                )}
                {showAvg && (
                  <YAxis 
                    yAxisId="line"
                    orientation={showSum ? "right" : "left"}
                    fontSize={12}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                )}
                
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="rect"
                />

                {/* 막대형 차트 (옵션에 따라 표시) */}
                {showSum && valueColumns.map((column, index) => {
                  // 해당 컬럼의 데이터가 실제로 있는지 확인
                  const hasData = chartData.some(item => item[`${column}_합계`] !== undefined && item[`${column}_합계`] > 0);
                  if (!hasData) return null;
                  
                  return (
                    <Bar
                      key={`${column}_합계`}
                      yAxisId="bar"
                      dataKey={`${column}_합계`}
                      fill={colors[index * 2 % colors.length]}
                      name={`${column} 합계`}
                      radius={[4, 4, 0, 0]}
                      fillOpacity={0.8}
                    />
                  );
                })}

                {/* 선형 차트 (옵션에 따라 표시) */}
                {showAvg && valueColumns.map((column, index) => {
                  // 해당 컬럼의 데이터가 실제로 있는지 확인
                  const hasData = chartData.some(item => item[`${column}_평균`] !== undefined && item[`${column}_평균`] > 0);
                  if (!hasData) return null;
                  
                  return (
                    <Line
                      key={`${column}_평균`}
                      yAxisId="line"
                      type="monotone"
                      dataKey={`${column}_평균`}
                      stroke={colors[(index * 2 + 1) % colors.length]}
                      strokeWidth={3}
                      name={`${column} 평균`}
                      dot={{ fill: colors[(index * 2 + 1) % colors.length], strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: colors[(index * 2 + 1) % colors.length], strokeWidth: 2 }}
                    />
                  );
                })}

                {/* 평균 기준선 (옵션에 따라 표시) */}
                {showAvg && showReferenceLine && stats && stats.map((stat, index) => {
                  const avgValue = Number(stat.avg);
                  if (avgValue <= 0) return null;
                  
                  return (
                    <ReferenceLine
                      key={`avg-line-${stat.column}`}
                      yAxisId="line"
                      y={avgValue}
                      stroke={colors[(index * 2 + 1) % colors.length]}
                      strokeDasharray="5 5"
                      strokeOpacity={0.5}
                      label={{ value: `${stat.column} 전체평균`, position: "top", fontSize: 10 }}
                    />
                  );
                })}
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 통계 요약 (선택된 컬럼만) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats
            .filter(stat => {
              // 실제 데이터가 있는 컬럼만 표시
              const hasData = Number(stat.sum) > 0 || Number(stat.avg) > 0;
              return hasData;
            })
            .map((stat, index) => (
              <Card key={stat.column} className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: colors[index * 2 % colors.length] }}
                    />
                    {stat.column} 통계
                    <Badge variant="outline" className="ml-2 text-xs">
                      선택됨
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {stat.sum}
                      </div>
                      <div className="text-xs text-muted-foreground">총 합계</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {stat.avg}
                      </div>
                      <div className="text-xs text-muted-foreground">평균</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {stat.max}
                      </div>
                      <div className="text-xs text-muted-foreground">최대값</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        {stat.min}
                      </div>
                      <div className="text-xs text-muted-foreground">최소값</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
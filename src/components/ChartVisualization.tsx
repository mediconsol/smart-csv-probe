import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  count?: number;
  avg?: number;
  percentage?: number;
  [key: string]: string | number | undefined;
}

interface ChartVisualizationProps {
  data: ChartData[];
  title: string;
}

export function ChartVisualization({ data, title }: ChartVisualizationProps) {
  // 데이터 유효성 검사 및 정제
  const validData = data.filter(item => 
    item && 
    item.name && 
    typeof item.value === 'number' && 
    !isNaN(item.value) && 
    isFinite(item.value)
  );

  const colors = [
    'hsl(var(--data-blue))',
    'hsl(var(--data-purple))',
    'hsl(var(--data-orange))',
    'hsl(var(--data-teal))',
    'hsl(var(--data-pink))',
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = validData.find(item => item.name === label);
      return (
        <div className="bg-card border border-border/50 rounded-lg p-3 shadow-card min-w-[200px]">
          <p className="font-medium mb-2">{label || '항목'}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : (entry.value || 'N/A')}
            </p>
          ))}
          {dataPoint && (
            <div className="mt-2 pt-2 border-t border-border/30 text-xs text-muted-foreground">
              {dataPoint.count && <p>건수: {dataPoint.count.toLocaleString()}개</p>}
              {dataPoint.avg && <p>평균: {dataPoint.avg.toFixed(2)}</p>}
              {dataPoint.percentage && <p>비율: {dataPoint.percentage.toFixed(1)}%</p>}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {validData.length === 0 ? (
          <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">시각화할 데이터가 없습니다</p>
              <p className="text-sm text-muted-foreground mt-1">
                합계 보고서를 실행하거나 데이터를 업로드해주세요
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="bar" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="bar" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                막대형
              </TabsTrigger>
              <TabsTrigger value="line" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                선형
              </TabsTrigger>
              <TabsTrigger value="area" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                영역형
              </TabsTrigger>
              <TabsTrigger value="pie" className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4" />
                원형
              </TabsTrigger>
            </TabsList>

          <TabsContent value="bar" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={validData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="url(#barGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--data-blue))" />
                    <stop offset="100%" stopColor="hsl(var(--data-purple))" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="line" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={validData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="area" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={validData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--data-orange))"
                  fill="url(#areaGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--data-orange))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--data-pink))" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="pie" className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={validData.slice(0, 5)} // 상위 5개만 표시
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {validData.slice(0, 5).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
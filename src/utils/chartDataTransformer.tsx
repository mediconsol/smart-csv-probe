// 쿼리 결과를 차트 데이터로 변환하는 유틸리티

export interface ChartDataPoint {
  name: string;
  value: number;
  count?: number;
  avg?: number;
  percentage?: number;
  [key: string]: string | number | undefined;
}

// 데이터 타입 추정
export const inferDataType = (value: any): string => {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') {
    // 숫자 형식 체크
    if (!isNaN(Number(value)) && value.trim() !== '') return 'number';
    return 'string';
  }
  return 'string';
};

// 숫자 값으로 변환
export const toNumber = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

// 쿼리 결과를 차트 데이터로 변환
export const transformQueryResultToChartData = (queryResult: any[]): ChartDataPoint[] => {
  if (!queryResult || queryResult.length === 0) {
    return [];
  }

  const columns = Object.keys(queryResult[0]);
  
  // 패턴 1: name/label과 value 컬럼이 있는 경우
  const nameColumns = columns.filter(col => 
    ['name', 'label', 'category', 'group', 'type', '분류', '그룹', '카테고리', '항목'].some(keyword => 
      col.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  const valueColumns = columns.filter(col => {
    const sampleValue = queryResult[0][col];
    const isNumeric = inferDataType(sampleValue) === 'number';
    const hasValueKeyword = ['value', 'count', 'sum', 'total', 'amount', 'avg', 'average', '합계', '개수', '평균', '총합'].some(keyword =>
      col.toLowerCase().includes(keyword.toLowerCase())
    );
    return isNumeric || hasValueKeyword;
  });

  // 패턴 2: 집계된 데이터 (GROUP BY 결과)
  if (nameColumns.length > 0 && valueColumns.length > 0) {
    return queryResult.map((row, index) => {
      const nameCol = nameColumns[0];
      const valueCol = valueColumns[0];
      
      const dataPoint: ChartDataPoint = {
        name: String(row[nameCol] || `항목 ${index + 1}`),
        value: toNumber(row[valueCol])
      };

      // 추가 컬럼들도 포함
      valueColumns.forEach(col => {
        if (col !== valueCol) {
          const colName = col.toLowerCase();
          if (colName.includes('count') || colName.includes('개수')) {
            dataPoint.count = toNumber(row[col]);
          } else if (colName.includes('avg') || colName.includes('average') || colName.includes('평균')) {
            dataPoint.avg = toNumber(row[col]);
          } else {
            dataPoint[col] = toNumber(row[col]);
          }
        }
      });

      return dataPoint;
    });
  }

  // 패턴 3: 단순 데이터 (첫 번째 컬럼을 name, 두 번째를 value로 사용)
  if (columns.length >= 2) {
    const nameCol = columns[0];
    const valueCol = columns.find(col => inferDataType(queryResult[0][col]) === 'number') || columns[1];
    
    return queryResult.slice(0, 50).map((row, index) => ({
      name: String(row[nameCol] || `항목 ${index + 1}`),
      value: toNumber(row[valueCol])
    }));
  }

  // 패턴 4: 단일 컬럼 데이터
  if (columns.length === 1) {
    const col = columns[0];
    if (inferDataType(queryResult[0][col]) === 'number') {
      // 숫자 데이터의 분포를 히스토그램 형태로 변환
      return createHistogramData(queryResult.map(row => toNumber(row[col])));
    } else {
      // 텍스트 데이터의 빈도 계산
      return createFrequencyData(queryResult.map(row => String(row[col])));
    }
  }

  // 기본값: 빈 배열
  return [];
};

// 히스토그램 데이터 생성
const createHistogramData = (numbers: number[]): ChartDataPoint[] => {
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const range = max - min;
  const binCount = Math.min(10, Math.ceil(Math.sqrt(numbers.length)));
  const binSize = range / binCount;

  const bins: { [key: string]: number } = {};
  
  numbers.forEach(num => {
    const binIndex = Math.min(Math.floor((num - min) / binSize), binCount - 1);
    const binStart = min + binIndex * binSize;
    const binEnd = binStart + binSize;
    const binLabel = `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`;
    
    bins[binLabel] = (bins[binLabel] || 0) + 1;
  });

  return Object.entries(bins).map(([name, count]) => ({
    name,
    value: count,
    count
  }));
};

// 빈도 데이터 생성
const createFrequencyData = (strings: string[]): ChartDataPoint[] => {
  const frequency: { [key: string]: number } = {};
  
  strings.forEach(str => {
    const key = str || '(빈 값)';
    frequency[key] = (frequency[key] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([name, count]) => ({
      name,
      value: count,
      count
    }));
};

// 차트 제목 자동 생성
export const generateChartTitle = (queryResult: any[], originalQuery: string): string => {
  if (!queryResult || queryResult.length === 0) {
    return "쿼리 결과";
  }

  const columns = Object.keys(queryResult[0]);
  const query = originalQuery.toLowerCase();

  // SQL 쿼리 분석을 통한 제목 생성
  if (query.includes('group by')) {
    const groupByMatch = query.match(/group\s+by\s+(\w+)/i);
    if (groupByMatch) {
      return `${groupByMatch[1]}별 분석 결과`;
    }
  }

  if (query.includes('count')) {
    return "개수 분석 결과";
  }

  if (query.includes('avg') || query.includes('average')) {
    return "평균 분석 결과";
  }

  if (query.includes('sum')) {
    return "합계 분석 결과";
  }

  if (columns.length >= 2) {
    return `${columns[0]} vs ${columns[1]} 분석`;
  }

  return "쿼리 결과 시각화";
};
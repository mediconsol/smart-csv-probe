import Papa from 'papaparse';

export interface ParsedData {
  columns: Array<{
    name: string;
    type: 'string' | 'number' | 'date';
    samples: string[];
  }>;
  rows: Record<string, string>[];
  totalRows: number;
}

export function detectColumnType(values: string[]): 'string' | 'number' | 'date' {
  const nonEmptyValues = values.filter(v => v && v.trim() !== '');
  if (nonEmptyValues.length === 0) return 'string';

  // 숫자 타입 검사
  const numberCount = nonEmptyValues.filter(v => {
    const num = parseFloat(v.replace(/,/g, ''));
    return !isNaN(num) && isFinite(num);
  }).length;

  if (numberCount / nonEmptyValues.length > 0.8) {
    return 'number';
  }

  // 날짜 타입 검사
  const dateCount = nonEmptyValues.filter(v => {
    const date = new Date(v);
    return !isNaN(date.getTime()) && v.match(/\d{4}|\d{2}\/\d{2}|\d{2}-\d{2}/);
  }).length;

  if (dateCount / nonEmptyValues.length > 0.7) {
    return 'date';
  }

  return 'string';
}

export function parseCSVFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as Record<string, string>[];
          const headers = Object.keys(rows[0] || {});
          
          const columns = headers.map(header => {
            const columnValues = rows.slice(0, 100).map(row => row[header] || '');
            const type = detectColumnType(columnValues);
            const samples = columnValues
              .filter(v => v && v.trim() !== '')
              .slice(0, 5);
            
            return {
              name: header,
              type,
              samples
            };
          });

          resolve({
            columns,
            rows,
            totalRows: rows.length
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function generateSampleData(): ParsedData {
  const sampleRows = [
    { id: '1', name: '홍길동', age: '25', city: '서울', salary: '3500000', join_date: '2023-01-15' },
    { id: '2', name: '김영희', age: '30', city: '부산', salary: '4200000', join_date: '2022-08-20' },
    { id: '3', name: '이철수', age: '28', city: '대구', salary: '3800000', join_date: '2023-03-10' },
    { id: '4', name: '박미영', age: '32', city: '인천', salary: '4500000', join_date: '2021-12-05' },
    { id: '5', name: '정대한', age: '27', city: '광주', salary: '3600000', join_date: '2023-05-22' },
    { id: '6', name: '최순영', age: '29', city: '대전', salary: '4000000', join_date: '2022-11-18' },
    { id: '7', name: '강민수', age: '26', city: '울산', salary: '3700000', join_date: '2023-02-28' },
    { id: '8', name: '윤수정', age: '31', city: '창원', salary: '4300000', join_date: '2022-06-12' },
    { id: '9', name: '임태영', age: '33', city: '고양', salary: '4600000', join_date: '2021-09-15' },
    { id: '10', name: '송미라', age: '24', city: '수원', salary: '3400000', join_date: '2023-07-08' }
  ];

  const columns = [
    { name: 'id', type: 'number' as const, samples: ['1', '2', '3', '4', '5'] },
    { name: 'name', type: 'string' as const, samples: ['홍길동', '김영희', '이철수', '박미영', '정대한'] },
    { name: 'age', type: 'number' as const, samples: ['25', '30', '28', '32', '27'] },
    { name: 'city', type: 'string' as const, samples: ['서울', '부산', '대구', '인천', '광주'] },
    { name: 'salary', type: 'number' as const, samples: ['3500000', '4200000', '3800000', '4500000', '3600000'] },
    { name: 'join_date', type: 'date' as const, samples: ['2023-01-15', '2022-08-20', '2023-03-10', '2021-12-05', '2023-05-22'] }
  ];

  return {
    columns,
    rows: sampleRows,
    totalRows: sampleRows.length
  };
}

export function executeQuery(data: ParsedData, query: string): any[] {
  // 간단한 쿼리 시뮬레이션
  const normalizedQuery = query.toLowerCase().trim();
  
  // 기본 통계 쿼리
  if (normalizedQuery.includes('count(*)')) {
    return [{ total_rows: data.totalRows, columns: data.columns.length }];
  }
  
  // 상위 값 쿼리 시뮬레이션
  if (normalizedQuery.includes('group by') && normalizedQuery.includes('count(*)')) {
    const cityData = data.rows.reduce((acc, row) => {
      const city = row.city || '기타';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(cityData)
      .map(([city, count]) => ({ name: city, value: count }))
      .sort((a, b) => b.value - a.value);
  }
  
  // 평균 급여 쿼리 시뮬레이션
  if (normalizedQuery.includes('avg') && normalizedQuery.includes('salary')) {
    const avgSalary = data.rows.reduce((sum, row) => {
      return sum + (parseFloat(row.salary) || 0);
    }, 0) / data.rows.length;
    
    return [{ avg_salary: Math.round(avgSalary) }];
  }
  
  // 기본적으로 전체 데이터 반환
  return data.rows.slice(0, 100);
}
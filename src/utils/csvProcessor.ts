import Papa from 'papaparse';
import initSqlJs from 'sql.js';

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

// SQL.js 데이터베이스 캐시
let sqlDatabase: any = null;
let currentDataHash: string = '';

// 안전한 컬럼명 생성 (SQL 예약어 및 특수문자 처리)
function sanitizeColumnName(columnName: string): string {
  // 특수문자를 언더스코어로 변경
  let sanitized = columnName
    .replace(/[^a-zA-Z0-9가-힣_]/g, '_')
    .replace(/^(\d)/, '_$1'); // 숫자로 시작하면 언더스코어 추가
  
  // SQL 예약어 처리
  const reservedWords = ['select', 'from', 'where', 'group', 'order', 'by', 'insert', 'update', 'delete', 'table', 'column', 'index', 'join', 'inner', 'outer', 'left', 'right', 'union', 'and', 'or', 'not', 'null', 'like', 'between', 'in', 'exists', 'case', 'when', 'then', 'else', 'end'];
  if (reservedWords.includes(sanitized.toLowerCase())) {
    sanitized = `col_${sanitized}`;
  }
  
  return sanitized;
}

// 컬럼명 매핑 저장
let columnMapping: { [original: string]: string } = {};

// 데이터를 SQL 데이터베이스로 변환
async function createSqlDatabase(data: ParsedData): Promise<any> {
  try {
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });
    
    const db = new SQL.Database();
    
    // 컬럼명 매핑 생성
    columnMapping = {};
    data.columns.forEach(col => {
      columnMapping[col.name] = sanitizeColumnName(col.name);
    });
    
    // 컬럼 정의 생성 (따옴표로 감싸기)
    const columnDefs = data.columns.map(col => {
      let sqlType = 'TEXT';
      if (col.type === 'number') sqlType = 'REAL';
      else if (col.type === 'date') sqlType = 'TEXT';
      const safeName = columnMapping[col.name];
      return `"${safeName}" ${sqlType}`;
    }).join(', ');
    
    // 테이블 생성
    const createTableSql = `CREATE TABLE data (${columnDefs})`;
    console.log('Creating table with SQL:', createTableSql);
    db.run(createTableSql);
    
    // 데이터 삽입
    const safeColumns = data.columns.map(col => `"${columnMapping[col.name]}"`);
    const placeholders = safeColumns.map(() => '?').join(', ');
    const insertSql = `INSERT INTO data (${safeColumns.join(', ')}) VALUES (${placeholders})`;
    
    const stmt = db.prepare(insertSql);
    
    data.rows.forEach(row => {
      const values = data.columns.map(col => {
        const value = row[col.name] || null;
        // 숫자 컬럼 처리
        if (col.type === 'number' && value) {
          const num = parseFloat(value.toString().replace(/,/g, ''));
          return isNaN(num) ? null : num;
        }
        return value;
      });
      stmt.run(values);
    });
    
    stmt.free();
    return db;
  } catch (error) {
    console.error('SQL 데이터베이스 생성 오류:', error);
    throw error;
  }
}

// 쿼리에서 원본 컬럼명을 안전한 컬럼명으로 변환
function translateQuery(query: string, data: ParsedData): string {
  let translatedQuery = query;
  
  // 각 컬럼명을 안전한 이름으로 치환
  data.columns.forEach(col => {
    const originalName = col.name;
    const safeName = columnMapping[originalName];
    if (safeName && safeName !== originalName) {
      // 단어 경계를 고려한 정확한 치환
      const regex = new RegExp(`\\b${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      translatedQuery = translatedQuery.replace(regex, `"${safeName}"`);
    } else {
      // 원본 컬럼명도 따옴표로 감싸기
      const regex = new RegExp(`\\b${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      translatedQuery = translatedQuery.replace(regex, `"${originalName}"`);
    }
  });
  
  return translatedQuery;
}

export async function executeQuery(data: ParsedData, query: string): Promise<any[]> {
  try {
    // 데이터 해시 생성 (간단한 체크섬)
    const dataHash = JSON.stringify(data.rows.slice(0, 5)) + data.totalRows;
    
    // 데이터베이스가 없거나 다른 데이터인 경우 새로 생성
    if (!sqlDatabase || currentDataHash !== dataHash) {
      sqlDatabase = await createSqlDatabase(data);
      currentDataHash = dataHash;
    }
    
    // 쿼리 번역
    const translatedQuery = translateQuery(query, data);
    console.log('Original query:', query);
    console.log('Translated query:', translatedQuery);
    
    // SQL 쿼리 실행
    const results = sqlDatabase.exec(translatedQuery);
    
    if (results.length === 0) {
      return [];
    }
    
    const result = results[0];
    const columns = result.columns;
    const values = result.values;
    
    // 결과를 객체 배열로 변환 (컬럼명을 원본으로 복원)
    const reverseMapping: { [safe: string]: string } = {};
    Object.entries(columnMapping).forEach(([original, safe]) => {
      reverseMapping[safe] = original;
    });
    
    return values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, index: number) => {
        // 안전한 컬럼명을 원본 컬럼명으로 복원
        const originalCol = reverseMapping[col] || col;
        obj[originalCol] = row[index];
      });
      return obj;
    });
    
  } catch (error) {
    console.error('SQL 쿼리 실행 오류:', error);
    
    // 오류 발생 시 fallback으로 기존 로직 사용
    return executeQueryFallback(data, query);
  }
}

// Fallback 쿼리 실행 (기존 로직)
function executeQueryFallback(data: ParsedData, query: string): any[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  // 기본 통계 쿼리
  if (normalizedQuery.includes('count(*)')) {
    return [{ total_rows: data.totalRows, columns: data.columns.length }];
  }
  
  // 그룹별 집계 쿼리 시뮬레이션
  if (normalizedQuery.includes('group by') && normalizedQuery.includes('count(*)')) {
    // 첫 번째 텍스트 컬럼으로 그룹핑
    const textColumn = data.columns.find(col => col.type === 'string');
    if (textColumn) {
      const groupData = data.rows.reduce((acc, row) => {
        const key = row[textColumn.name] || '기타';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      return Object.entries(groupData)
        .map(([name, count]) => ({ [textColumn.name]: name, count }))
        .sort((a, b) => b.count - a.count);
    }
  }
  
  // 평균 계산 쿼리 시뮬레이션
  if (normalizedQuery.includes('avg(')) {
    const numColumn = data.columns.find(col => col.type === 'number');
    if (numColumn) {
      const avg = data.rows.reduce((sum, row) => {
        return sum + (parseFloat(row[numColumn.name]) || 0);
      }, 0) / data.rows.length;
      
      return [{ [`avg_${numColumn.name}`]: Math.round(avg) }];
    }
  }
  
  // 기본적으로 상위 100개 행 반환
  return data.rows.slice(0, 100);
}
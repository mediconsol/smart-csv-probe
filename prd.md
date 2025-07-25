# CSV 분석 프로그램 개발 가이드

## 🏗️ 기본 아키텍처

### 프론트엔드 (React/Next.js)

```
src/
├── components/
│   ├── FileUpload.jsx        # 파일 업로드
│   ├── DataPreview.jsx       # 데이터 미리보기
│   ├── QueryBuilder.jsx      # SQL 쿼리 빌더
│   ├── Charts/
│   │   ├── TimeSeriesChart.jsx
│   │   ├── StatisticsChart.jsx
│   │   └── OutlierChart.jsx
│   └── AIAssistant.jsx       # AI 분석 도우미
├── hooks/
│   ├── useChunkProcessor.js  # 청크 처리 훅
│   ├── useDuckDB.js         # DuckDB 연동
│   └── useAIAnalysis.js     # AI 분석 훅
└── utils/
    ├── csvChunker.js        # CSV 청크 분할
    ├── timeSeriesAnalysis.js
    └── outlierDetection.js
```

### 백엔드 (Node.js/Python)

```
backend/
├── routes/
│   ├── upload.js            # 파일 업로드 처리
│   ├── analysis.js          # 데이터 분석
│   └── ai.js               # AI 기능
├── services/
│   ├── chunkProcessor.js    # 청크 처리 서비스
│   ├── duckdbService.js     # DuckDB 연동
│   └── aiService.js         # AI 분석 서비스
└── utils/
    ├── memoryManager.js     # 메모리 관리
    └── streamProcessor.js   # 스트림 처리
```

## 🔁 청크 기반 처리 구현

### JavaScript (프론트엔드)

```javascript
// csvChunker.js
export class CSVChunker {
  constructor(chunkSize = 10000) {
    this.chunkSize = chunkSize;
  }

  async *processFileInChunks(file) {
    const stream = file.stream();
    const reader = stream.getReader();
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += new TextDecoder().decode(value);
      const lines = buffer.split('\n');
      buffer = lines.pop(); // 마지막 불완전한 줄 보관
      
      if (lines.length >= this.chunkSize) {
        yield lines.splice(0, this.chunkSize);
      }
    }
    
    if (buffer) yield [buffer];
  }
}
```

### Python (백엔드)

```python
import pandas as pd
import dask.dataframe as dd

class ChunkProcessor:
    def __init__(self, chunk_size=10000):
        self.chunk_size = chunk_size
    
    def process_large_csv(self, file_path):
        # Dask로 청크 단위 처리
        df = dd.read_csv(file_path, blocksize=f"{self.chunk_size}KB")
        return df
    
    def stream_process(self, file_path, callback):
        for chunk in pd.read_csv(file_path, chunksize=self.chunk_size):
            processed_chunk = callback(chunk)
            yield processed_chunk
```

## 🧠 AI 분석 도우미

### OpenAI API 연동

```javascript
// aiService.js
import OpenAI from 'openai';

export class AIAnalysisService {
  constructor(apiKey) {
    this.openai = new OpenAI({ apiKey });
  }

  async analyzeDataPattern(dataSchema, sampleData) {
    const prompt = `
    데이터 스키마: ${JSON.stringify(dataSchema)}
    샘플 데이터: ${JSON.stringify(sampleData.slice(0, 5))}
    
    다음을 분석해주세요:
    1. 이상치 탐지를 위한 조건 추천
    2. 시계열 분석 가능한 컬럼 식별
    3. 상관관계 분석 추천
    `;
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });
    
    return response.choices[0].message.content;
  }

  async detectOutliers(data, column) {
    // 통계적 이상치 탐지
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    const mean = values.reduce((a, b) => a + b) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2)) / values.length);
    
    return data.filter(row => {
      const value = parseFloat(row[column]);
      return Math.abs(value - mean) > 2 * std;
    });
  }
}
```

## ⏱️ 시간대별 변화 분석

### 시계열 분석 컴포넌트

```javascript
// TimeSeriesAnalysis.js
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function TimeSeriesAnalysis({ data, timeColumn, valueColumn }) {
  const processedData = data.map(row => ({
    time: new Date(row[timeColumn]),
    value: parseFloat(row[valueColumn])
  })).sort((a, b) => a.time - b.time);

  // 이동평균 계산
  const movingAverage = (data, window = 7) => {
    return data.map((item, index) => {
      const start = Math.max(0, index - window + 1);
      const values = data.slice(start, index + 1).map(d => d.value);
      const avg = values.reduce((a, b) => a + b) / values.length;
      return { ...item, movingAvg: avg };
    });
  };

  const dataWithMA = movingAverage(processedData);

  return (
    <div>
      <LineChart width={800} height={400} data={dataWithMA}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
        <Line type="monotone" dataKey="movingAvg" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}
```

## 🧪 SQL 쿼리 분석 (DuckDB)

### DuckDB 연동

```javascript
// duckdbService.js
import * as duckdb from '@duckdb/duckdb-wasm';

export class DuckDBService {
  constructor() {
    this.db = null;
    this.conn = null;
  }

  async initialize() {
    const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
    const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);
    const worker = new Worker(bundle.mainWorker);
    const logger = new duckdb.ConsoleLogger();
    this.db = new duckdb.AsyncDuckDB(logger, worker);
    await this.db.instantiate(bundle.mainModule);
    this.conn = await this.db.connect();
  }

  async loadCSVData(csvData, tableName = 'data') {
    // CSV 데이터를 DuckDB 테이블로 로드
    await this.conn.query(`
      CREATE TABLE ${tableName} AS 
      SELECT * FROM read_csv_auto('${csvData}')
    `);
  }

  async executeQuery(query) {
    try {
      const result = await this.conn.query(query);
      return result.toArray();
    } catch (error) {
      throw new Error(`SQL 실행 오류: ${error.message}`);
    }
  }

  // 자주 사용되는 쿼리 템플릿
  getQueryTemplates() {
    return {
      topN: (table, column, n = 10) => 
        `SELECT * FROM ${table} ORDER BY ${column} DESC LIMIT ${n}`,
      
      dateRange: (table, dateColumn, startDate, endDate) =>
        `SELECT * FROM ${table} WHERE ${dateColumn} BETWEEN '${startDate}' AND '${endDate}'`,
      
      aggregateByDate: (table, dateColumn, valueColumn) =>
        `SELECT DATE_TRUNC('day', ${dateColumn}) as date, 
         AVG(${valueColumn}) as avg_value,
         COUNT(*) as count
         FROM ${table} 
         GROUP BY DATE_TRUNC('day', ${dateColumn})
         ORDER BY date`,
      
      outliers: (table, column) =>
        `WITH stats AS (
           SELECT AVG(${column}) as mean, 
                  STDDEV(${column}) as std
           FROM ${table}
         )
         SELECT * FROM ${table}, stats 
         WHERE ABS(${column} - mean) > 2 * std`
    };
  }
}
```

## 📦 필요한 라이브러리

### 프론트엔드

```json
{
  "dependencies": {
    "@duckdb/duckdb-wasm": "^1.28.0",
    "recharts": "^2.8.0",
    "papaparse": "^5.4.1",
    "lodash": "^4.17.21",
    "react-query": "^3.39.3",
    "openai": "^4.20.1"
  }
}
```

### 백엔드 (Python)

```
pandas>=2.0.0
dask[complete]>=2023.1.0
duckdb>=0.9.0
fastapi>=0.104.0
openai>=1.0.0
numpy>=1.24.0
scipy>=1.10.0
```

## 🚀 구현 단계

### 1단계: 기본 파일 처리

- 파일 업로드 및 청크 분할
- 기본 데이터 미리보기
- 메모리 사용량 모니터링

### 2단계: DuckDB 연동

- CSV를 DuckDB 테이블로 변환
- 기본 SQL 쿼리 실행
- 쿼리 빌더 UI 구현

### 3단계: AI 분석 기능

- OpenAI API 연동
- 데이터 패턴 분석
- 이상치 탐지 알고리즘

### 4단계: 시계열 분석

- 시간 데이터 파싱
- 차트 라이브러리 연동
- 예측 모델 구현

### 5단계: 최적화

- 청크 처리 성능 개선
- 캐싱 전략 구현
- 사용자 경험 개선

## 💡 추가 고려사항

### 성능 최적화

- Web Workers로 백그라운드 처리
- Virtual scrolling으로 대용량 데이터 렌더링
- 메모리 사용량 실시간 모니터링

### 보안

- 파일 업로드 검증
- SQL 인젝션 방지
- API 키 보안 관리

### 사용성

- 진행률 표시
- 에러 핸들링
- 반응형 디자인

이 구조로 시작하면 요구사항에 맞는 강력한 CSV 분석 도구를 만들 수 있습니다!

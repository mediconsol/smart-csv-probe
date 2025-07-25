# 메디콘솔 - 의료 데이터 분석 플랫폼

Google AI Studio를 활용한 고급 CSV 파일 분석 및 시각화 도구

🌐 **Live Demo**: [https://smart-csv-probe.vercel.app](https://smart-csv-probe.vercel.app)

## 🚀 주요 기능

### 📊 데이터 분석
- **파일 업로드**: 드래그 앤 드롭으로 간편한 CSV 파일 업로드
- **데이터 개요**: 파일 정보 및 컬럼 분석
- **컬럼 관리**: 실시간 컬럼 타입 변경 (숫자/텍스트/날짜/불린)

### 🔍 AI 쿼리 분석
- **Google AI Studio 연동**: 자연어를 SQL로 자동 변환
- **실제 SQL 실행**: SQL.js 기반 실시간 쿼리 실행
- **스마트 제안**: 데이터 구조 기반 맞춤형 분석 제안
- **오류 방지**: 컬럼명 자동 안전화 처리

### 📈 다중 컬럼 합계 보고서
- **다차원 그룹핑**: 여러 컬럼 조합으로 교차 분석
- **다중 값 집계**: 여러 숫자 컬럼 동시 분석
- **고급 통계**: 합계, 평균, 백분율 자동 계산
- **전문 테이블**: 정렬, 필터, CSV 내보내기 지원

### 📊 스마트 데이터 시각화
- **자동 데이터 변환**: 쿼리 결과를 차트에 최적화
- **다양한 차트**: 막대, 파이, 선형, 히스토그램 지원
- **반응형 디자인**: 모바일/데스크톱 최적화

### 🧠 AI 데이터 인사이트
- **실시간 분석**: 실제 데이터 기반 AI 인사이트 생성
- **의료 특화**: 의료 데이터 관점의 전문 분석
- **4가지 인사이트**: 트렌드, 이상치, 패턴, 권장사항
- **신뢰도 점수**: 각 인사이트의 신뢰성 표시

## 🛠 기술 스택

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: ShadCN/UI, Tailwind CSS
- **AI Integration**: Google AI Studio (Gemini 1.5 Flash)
- **SQL Engine**: SQL.js (SQLite in browser)
- **Charts**: Recharts, Chart.js
- **Data Processing**: PapaCSV
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with medical-themed gradients

## 🎯 사용법

1. **데이터 업로드**: CSV 파일을 드래그 앤 드롭하거나 샘플 데이터로 시작
2. **데이터 탐색**: 데이터 개요 탭에서 컬럼 정보 확인
3. **타입 변경**: 필요시 컬럼 관리에서 데이터 타입 변경
4. **분석 실행**: 쿼리 분석이나 합계 보고서로 데이터 분석
5. **시각화**: 차트로 결과 시각화
6. **인사이트**: AI 분석 결과 확인

## 🚀 Vercel 배포

이 프로젝트는 **Vercel 전용**으로 최적화되어 있습니다.

### 🌐 자동 배포
- **저장소**: `https://github.com/mediconsol/smart-csv-probe`
- **플랫폼**: Vercel (권장)
- **도메인**: https://smart-csv-probe.vercel.app
- **배포 방식**: GitHub push 시 자동 배포

### 🛠 로컬 개발

```bash
# 저장소 복제
git clone https://github.com/mediconsol/smart-csv-probe.git
cd smart-csv-probe

# 의존성 설치
npm install

# 개발 서버 실행 (포트 8080)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### ⚙️ Vercel 배포 설정

프로젝트는 다음과 같이 자동 구성됩니다:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "cleanUrls": true,
  "trailingSlash": false
}
```

- ✅ SPA 라우팅 지원
- ✅ Asset 캐싱 최적화
- ✅ 자동 SSL 인증서
- ✅ CDN 글로벌 배포

## 📄 라이선스

MIT License

## 🤖 생성 정보

Generated with [Claude Code](https://claude.ai/code)
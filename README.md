# Smart CSV Probe

고급 CSV 파일 분석 및 시각화 도구

## 🚀 주요 기능

### 📊 데이터 분석
- **파일 업로드**: 드래그 앤 드롭으로 간편한 CSV 파일 업로드
- **데이터 개요**: 파일 정보 및 컬럼 분석
- **컬럼 관리**: 실시간 컬럼 타입 변경 (숫자/텍스트/날짜/불린)

### 🔍 쿼리 분석
- **SQL 쿼리 빌더**: 직관적인 쿼리 작성 인터페이스
- **템플릿 제공**: 자주 사용하는 쿼리 패턴 제공
- **실시간 실행**: 즉시 쿼리 결과 확인

### 📈 합계 보고서
- **항목별 집계**: 그룹별 건수, 합계, 평균 계산
- **시각적 표현**: 진행률 바로 비율 표시
- **CSV 내보내기**: 보고서 결과 다운로드

### 📊 데이터 시각화
- **차트 생성**: 데이터를 다양한 차트로 시각화
- **인터랙티브**: 동적 차트 상호작용

### 🤖 AI 인사이트
- **패턴 분석**: 데이터 패턴 자동 탐지
- **품질 검사**: 데이터 품질 평가
- **분석 추천**: AI 기반 분석 방향 제안

## 🛠 기술 스택

- **Frontend**: React, TypeScript, Vite
- **UI**: ShadCN/UI, Tailwind CSS
- **Charts**: Recharts
- **Data Processing**: PapaCSV
- **Styling**: Tailwind CSS with custom gradients

## 🎯 사용법

1. **데이터 업로드**: CSV 파일을 드래그 앤 드롭하거나 샘플 데이터로 시작
2. **데이터 탐색**: 데이터 개요 탭에서 컬럼 정보 확인
3. **타입 변경**: 필요시 컬럼 관리에서 데이터 타입 변경
4. **분석 실행**: 쿼리 분석이나 합계 보고서로 데이터 분석
5. **시각화**: 차트로 결과 시각화
6. **인사이트**: AI 분석 결과 확인

## 🚀 배포

이 프로젝트는 Vercel에 배포되어 있습니다.

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 미리보기
npm run preview
```

## 🌐 Vercel 배포 단계

1. [Vercel](https://vercel.com)에 로그인
2. "Import Project" 또는 "New Project" 클릭
3. GitHub 리포지토리 연결: `https://github.com/mediconsol/smart-csv-probe`
4. 프레임워크 프리셋: **Vite** 선택
5. 빌드 설정 확인:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. "Deploy" 버튼 클릭

### 환경 설정

프로젝트 루트에 `vercel.json` 파일이 포함되어 있어 자동으로 올바른 설정이 적용됩니다.

## 📄 라이선스

MIT License

## 🤖 생성 정보

Generated with [Claude Code](https://claude.ai/code)
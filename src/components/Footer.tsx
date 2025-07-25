import { MediconsolIcon } from '@/components/ui/icons/MediconsolLogo';
import { Card } from '@/components/ui/card';
import { Mail, Globe, Shield, FileText, BarChart3 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 섹션 */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <MediconsolIcon size={32} />
              <div>
                <h3 className="text-xl font-bold">메디콘솔</h3>
                <p className="text-sm text-muted-foreground">MediConsol</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              의료 데이터 분석의 새로운 표준. CSV 파일을 업로드하여 즉시 데이터를 분석하고, 
              AI 도움을 받아 의미있는 인사이트를 발견하세요.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>mediconsol.co.kr</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>contact@mediconsol.co.kr</span>
              </div>
            </div>
          </div>

          {/* 주요 기능 */}
          <div>
            <h4 className="font-semibold mb-4">주요 기능</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>CSV 데이터 분석</span>
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>실시간 시각화</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>SQL 쿼리 지원</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>AI 인사이트</span>
              </li>
            </ul>
          </div>

          {/* 기업 정보 */}
          <div>
            <h4 className="font-semibold mb-4">회사 정보</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>메디콘솔 주식회사</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>대표이사: 홍길동</p>
              <p>주소: 서울특별시 강남구<br />테헤란로 123, 456호</p>
            </div>
          </div>
        </div>

        {/* 하단 구분선 및 저작권 */}
        <div className="border-t border-border/30 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 메디콘솔. All rights reserved.</span>
              <span className="hidden md:inline">|</span>
              <span>mediconsol.co.kr</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="hover:text-foreground transition-colors">
                개인정보처리방침
              </button>
              <span>|</span>
              <button className="hover:text-foreground transition-colors">
                이용약관
              </button>
              <span>|</span>
              <button className="hover:text-foreground transition-colors">
                고객지원
              </button>
            </div>
          </div>
        </div>

        {/* 기술 스택 표시 */}
        <div className="mt-6 pt-4 border-t border-border/20">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <Card className="px-2 py-1 bg-gradient-primary text-primary-foreground">
              <span className="font-mono">React + TypeScript + Vite</span>
            </Card>
            <span>•</span>
            <Card className="px-2 py-1 bg-gradient-data text-white">
              <span className="font-mono">Recharts + Tailwind CSS</span>
            </Card>
          </div>
        </div>
      </div>
    </footer>
  );
}
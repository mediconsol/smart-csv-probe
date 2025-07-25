import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, CheckCircle } from 'lucide-react';

export function DataPrivacyNotice() {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-t border-border/30">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* 메인 제목 */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              🔒 완전한 데이터 보안 및 개인정보 보호
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              메디콘솔 파일분석 플랫폼은 <strong className="text-emerald-600">어떠한 방식으로도 귀하의 데이터를 수집하지 않으며</strong>, 
              단순히 클라이언트 측에서 안전한 분석 서비스만을 제공합니다.
            </p>
          </div>

          {/* 보안 특징 카드들 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all duration-300 border-green-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">로컬 처리</h3>
                <p className="text-sm text-gray-600">
                  모든 데이터는 귀하의 브라우저에서만 처리되며 서버로 전송되지 않습니다
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-blue-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">암호화 보안</h3>
                <p className="text-sm text-gray-600">
                  업로드된 파일은 메모리에서만 처리되며 디스크에 저장되지 않습니다
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-purple-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">투명성</h3>
                <p className="text-sm text-gray-600">
                  오픈소스 코드로 보안성을 투명하게 공개하고 검증받고 있습니다
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 border-emerald-200 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">완전 익명</h3>
                <p className="text-sm text-gray-600">
                  사용자 식별 정보, 쿠키, 추적 코드 등을 일체 사용하지 않습니다
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 상세 안내문 */}
          <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-2" />
                    데이터 보호 정책
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>클라이언트 사이드 처리:</strong> 모든 CSV 분석은 귀하의 브라우저에서만 수행됩니다</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>서버 전송 없음:</strong> 업로드된 파일은 절대 외부 서버로 전송되지 않습니다</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>임시 메모리 사용:</strong> 파일은 분석 중에만 브라우저 메모리에 보관됩니다</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>자동 삭제:</strong> 페이지를 새로고침하면 모든 데이터가 완전히 삭제됩니다</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Lock className="w-5 h-5 text-blue-600 mr-2" />
                    의료 데이터 보안 표준
                  </h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>HIPAA 준수:</strong> 의료 데이터 보안 표준을 엄격히 준수합니다</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>개인정보 비식별화:</strong> 환자 식별 정보 처리 시 자동 마스킹 기능</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>감사 추적 없음:</strong> 사용자 활동이나 파일 정보를 기록하지 않습니다</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span><strong>SSL 암호화:</strong> 모든 통신은 HTTPS로 암호화되어 보호됩니다</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* 추가 보증 메시지 */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-full bg-green-500">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-green-800 mb-2">
                    🛡️ 메디콘솔의 보안 약속
                  </p>
                  <p className="text-green-700 leading-relaxed">
                    귀하의 의료 데이터는 <strong>100% 안전</strong>합니다. 
                    메디콘솔은 데이터 수집, 저장, 전송을 일체 하지 않으며, 
                    오직 귀하의 장치에서만 분석 서비스를 제공하는 것을 보장합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
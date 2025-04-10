import os
from dotenv import load_dotenv
from corp_code_lookup import get_corp_code_by_name
from financials_lookup import get_financial_statements
from save_to_neo4j import FinancialGraph

# ✅ .env.local 로드 (backend/에 위치)
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env.local')
load_dotenv(dotenv_path=env_path)

# 테스트 출력 (필요시 제거)
print("🔧 NEO4J_URI =", os.getenv("NEO4J_URI"))

# 기업명 입력
corp_name = input("기업명을 입력하세요: ").strip()

# Step 1: 기업 고유번호 조회
corp_code = get_corp_code_by_name(corp_name)
if not corp_code:
    print("❌ 기업명을 찾을 수 없습니다.")
    exit()
print(f"✅ {corp_name} 고유번호: {corp_code}")

# 저장 대상 연도 및 보고서
years = ["2021", "2022", "2023", "2024"]
report_code = "11011"  # 사업보고서
report_name = "사업보고서"
fs_div = "CFS"  # 연결재무제표

# Neo4j 저장용 클래스 인스턴스
graph = FinancialGraph()

# 반복해서 저장
for year in years:
    result = get_financial_statements(
        corp_code=corp_code,
        year=year,
        report_code=report_code,
        fs_div=fs_div
    )

    if result.get("status") != "000" or "list" not in result or not result["list"]:
        print(f"⚠️ {year}년 재무제표 없음 or 오류: {result.get('message', '알 수 없는 오류')}")
        continue

    try:
        graph.save_company_financials(
            company_name=corp_name,
            corp_code=corp_code,
            year=year,
            report_type=report_name,
            financial_data=result["list"]
        )
        print(f"✅ {year}년 재무제표 저장 완료")
    except Exception as e:
        print(f"❌ Neo4j 저장 실패: {e}")

graph.close()
print("🏁 전체 저장 완료")
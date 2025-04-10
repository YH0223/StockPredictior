import os
import ssl
import certifi
from neo4j import GraphDatabase
from dotenv import load_dotenv

# .env.local 로드
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
load_dotenv(dotenv_path=env_path)

# SSL 인증서 검증 context
ssl_context = ssl.create_default_context(cafile=certifi.where())

NEO4J_URI = os.getenv("NEO4J_URI")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

class FinancialGraph:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            NEO4J_URI,
            auth=(NEO4J_USERNAME, NEO4J_PASSWORD),
            ssl_context=ssl_context
        )

    def close(self):
        self.driver.close()

    def save_company_financials(
        self,
        company_name: str,
        corp_code: str,
        year: str,
        report_type: str,
        financial_data: list
    ):
        important_items = [
            "매출액", "영업이익", "당기순이익",
            "자산총계", "부채총계", "자본총계",
            "자본금", "연구개발비"
        ]

        with self.driver.session() as session:
            session.write_transaction(
                self._create_company_and_items,
                company_name,
                corp_code,
                year,
                report_type,
                financial_data,
                important_items
            )

    @staticmethod
    def _create_company_and_items(
        tx, company_name, corp_code, year, report_type, data, important_items
    ):
        # 회사 노드 생성
        tx.run(
            "MERGE (c:Company {name: $name, corp_code: $code})",
            name=company_name,
            code=corp_code
        )

        # 재무 항목 노드: 회사별 + 항목명 + 연도 기준으로 유일화
        for item in data:
            if item.get("account_nm") not in important_items:
                continue

            tx.run(
                """
                MERGE (f:FinancialItem {
                    name: $name,
                    year: $year,
                    company: $company
                })
                SET f.value = $value
                WITH f
                MATCH (c:Company {corp_code: $corp_code})
                MERGE (c)-[:HAS_FINANCIAL {
                    year: $year,
                    report: $report_type
                }]->(f)
                """,
                name=item["account_nm"],
                year=year,
                company=company_name,
                value=item.get("thstrm_amount", ""),
                corp_code=corp_code,
                report_type=report_type
            )

from neo4j import GraphDatabase
from dotenv import load_dotenv
import os

# 환경변수 로딩
load_dotenv(dotenv_path=".env.local")

uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USERNAME")
password = os.getenv("NEO4J_PASSWORD")

print("🔌 Connecting to Neo4j:", uri)

try:
    driver = GraphDatabase.driver(uri, auth=(user, password))
    with driver.session() as session:
        result = session.run("RETURN '✅ 연결 성공!' AS result")
        print(result.single()["result"])
except Exception as e:
    print("❌ 연결 실패:", e)

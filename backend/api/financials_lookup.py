import os
import requests
from dotenv import load_dotenv

# 🔐 .env.local에서 API 키 불러오기
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
load_dotenv(dotenv_path=env_path)

DART_API_KEY = os.getenv("DART_API_KEY")

def get_financial_statements(corp_code: str, year: str = "2022", report_code: str = "11011", fs_div: str = "CFS"):
    url = "https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json"

    params = {
        "crtfc_key": DART_API_KEY,
        "corp_code": corp_code,
        "bsns_year": year,
        "reprt_code": report_code,
        "fs_div": fs_div  # ✅ 필수 추가!
    }

    print(f"📡 API 요청 중... params: {params}")
    response = requests.get(url, params=params)
    print(f"🔄 응답 코드: {response.status_code}")
    print(f"📦 응답 일부: {response.text[:300]}...\n")

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API 호출 실패: {response.status_code} - {response.text}")

    
    
import os
import requests
import zipfile
import xml.etree.ElementTree as ET
from typing import Optional
from dotenv import load_dotenv

# 🔐 .env.local에서 API 키 불러오기
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
load_dotenv(dotenv_path=env_path)

DART_API_KEY = os.getenv("DART_API_KEY")

def get_corp_code_by_name(company_name: str) -> Optional[str]:
    """
    기업명을 입력받아 DART에서 해당 기업의 고유번호(corp_code)를 반환합니다.
    """
    url = f"https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key={DART_API_KEY}"
    zip_path = "./api/corp_code.zip"

    # 1. 기업 고유번호 zip 파일 다운로드
    with requests.get(url, stream=True) as r:
        if r.status_code != 200:
            raise Exception("기업 고유번호 zip 파일 다운로드 실패")
        with open(zip_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)

    # 2. 압축 해제
    extract_path = "./api/corp_data"
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)

    # 3. XML 파싱하여 기업명 검색
    tree = ET.parse(f"{extract_path}/CORPCODE.xml")
    root = tree.getroot()

    for item in root.findall('list'):
        name = item.find('corp_name').text.strip()
        code = item.find('corp_code').text.strip()
        if name == company_name:
            return code

    return None
# StockPredictor (Ontology-based Stock Assistant) 

온톨로지 기반(Neo4j)으로 **주가/수급/뉴스·감성·이벤트** 데이터를 의미 단위로 연결하고,  
조회/분석 파이프라인과 예측 실험을 수행한 프로젝트입니다.  
예측 성능 목표 미달 이후 **LSR-IGRU 기반 상대 점수(랭킹) 서비스로 피벗**했습니다.

---

## Overview
- **Period**: 2025.03 ~ 2025.06 (3 months)
- **Team**: 4
- **Goal**
  - 정형(가격/수급) + 비정형(뉴스/이슈) 데이터를 단순 병합이 아니라 **Ontology(개념/관계)**로 구조화
  - **수집 → 전처리 → Neo4j 적재 → 조회/시각화**까지 파이프라인 구성
  - 예측/분석 실험을 반복할 수 있도록 입력 데이터(피처) 생성 및 검증 가능한 형태로 축적

---

## Tech Stack
- **Data/ML**: Python, Pandas, Torch(LSTM), HuggingFace (Sentiment/Event)
- **Crawler**: Selenium → Playwright, BeautifulSoup (Naver search/date-based crawling)
- **Graph DB**: Neo4j, Cypher
- **API Server**: FastAPI
- **Frontend**: Next.js
- **External Data**: Naver News API/Search, Stock OpenAPI
- **Collaboration**: GitHub

---

## My Role
- 뉴스/가격 데이터 **수집 파이프라인 구현 및 전처리**
- 감성/이벤트 추출 결과 **정규화(엔티티/관계 매핑)** 및 온톨로지 스키마 적용
- Neo4j 온톨로지 모델 설계 + **Cypher 기반 적재 로직 구현**
- 온톨로지 기반 조회 API(FastAPI) 및 조회/시각화 UI(Next.js) 구성
- 예측 실험(LSTM) 진행 후 **성능 목표 미달 원인 분석(지표/검증/누수 가능성)**
- SOTA 모델 조사 및 **조건에 맞는 모델(LSR-IGRU) 탐색/적용**

---

## Key Design
### Ontology Model (Core Axis)
- `Company -> TimeSeries -> Date` 를 기준 축으로 두고,
- `News / Event / Sentiment`를 관계로 연결해 “이슈가 어떤 종목·기간에 연결되는지”를 추적 가능하게 구성했습니다.

---

## What I Built (Pipeline)
1. **Collect**: 뉴스/가격 데이터 수집
2. **Preprocess**: 날짜 기준 정합성 맞춤, 피처 생성
3. **Load**: Neo4j 온톨로지 적재(Cypher)
4. **Serve**: FastAPI로 조회/랭킹 API 제공
5. **View**: Next.js로 결과 확인(랭킹/기업 단위 조회)

---

## Problem Solving & Results

### 1) Data Collection Stabilization (Selenium → Playwright)
- **Issue**: 뉴스 수집이 로봇 탐지로 자주 차단되어 장기간 데이터 축적이 불안정
- **Fix**: Playwright로 전환 + 네이버 검색 기반 **날짜 단위 수집 전략** 적용, 누락 감소
- **Result**: 수집 → 정제 → 저장 파이프라인을 확보해 실험 반복 기반을 마련

### 2) Ontology-based Integration in Neo4j
- **Issue**: 가격/뉴스/감성/이벤트가 분리되면 병합 비용이 커지고 추적이 어려움
- **Fix**: `Company-TimeSeries-Date` 축에 `News/Event/Sentiment`를 관계로 연결해 적재
- **Result**: 날짜 단위 피처 생성/추적이 쉬워지고 그래프 질의 기반 분석이 가능

### 3) LSTM (Torch) 직접 구현 → 성능 목표 미달 *(Failure)*
- **Issue**: 평균값 수렴/과적합, 평가 지표 선정·해석 미숙, 누수 가능성 점검 부족
- **Takeaway**: 모델 변경 전에 **지표/백테스트 조건 고정 + 데이터 분리/누수 점검**이 선행되어야 함
- **Output**: 검증 체크리스트(지표/조건/누수 점검 기준)로 정리

### 4) Pivot: LSR-IGRU 적용 → KRX400 재학습 → 상대 점수 기반 랭킹
- **Issue**: 예측값 자체를 내세우기엔 성능/검증 조건이 부족했고 사용자 가치가 낮다고 판단
- **Fix**:
  - 수집된 시계열/피처 데이터를 그대로 활용 가능한 **LSR-IGRU 모델로 전환**
  - **KRX400 기업군**에 맞춰 재학습
  - “미래 값 예측” 대신 **기업 간 상대 점수 산출 및 랭킹**으로 목표 변경
  - FastAPI로 **점수/랭킹 조회 API** 제공
- **Result**: 예측 실패로 종료하지 않고, 기존 데이터 파이프라인/온톨로지 자산을 재사용해 결과물을 남김

### 5) Verification Path: Next.js UI
- **Issue**: 점수/랭킹이 있어도 확인 경로가 없으면 활용이 어려움
- **Fix**: Next.js로 랭킹/기업 단위 조회 화면 구성
- **Result**: “데이터 생성 → API → 화면 확인” 흐름 완성, 결과 재현/검증 가능

---

## Lessons Learned
- 예측 프로젝트에서 “모델 개선”보다 먼저 필요한 것은 **평가 지표/백테스트 조건 고정**과 **데이터 누수 방지**였습니다.
- 실패 이후에도 수집/전처리/온톨로지 적재 자산을 재사용해, **상대 점수 기반 의사결정 보조**로 방향 전환이 가능했습니다.



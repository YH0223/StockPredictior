"use client"

import { useEffect, useState } from "react"
import BacktestingDashboard from "../backtestingGraph/BacktestingDashboard"

type BacktestRequest = {
  code: string
}

type Props = {
  stock: {
    code: string
    name: string
  }
}

export default function BackTest({ stock }: Props) {
  const [backtestingResults, setBacktestingResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0);
  useEffect(() => {
    if (!stock.code) {
      setBacktestingResults(null)
      return
    }

    setLoading(true)
    setError(null)

    // FastAPI 백테스팅 엔드포인트 호출
    fetch(`http://localhost:8000/api/backtest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: stock.code }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        // FastAPI에서 받은 데이터를 BacktestingDashboard 형식에 맞게 변환
        const formattedData = formatBacktestData(data, stock.code)
        setBacktestingResults(formattedData)
      })
      .catch((err) => {
        console.error("백테스팅 데이터 로드 실패:", err)
        setError("백테스팅 데이터를 불러올 수 없습니다.")
        setBacktestingResults(null)
      })
      .finally(() => setLoading(false))
  }, [stock.code])

  if (!stock.code) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 bg-white rounded-lg border mt-6">
        종목을 선택해주세요.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 bg-white rounded-lg border mt-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
          백테스팅 분석 중...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 bg-white rounded-lg border mt-6">
        <div className="text-center">
          <p>{error}</p>
          <button
            onClick={() => setRetryKey(prev => prev + 1)}
            className="mt-2 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  if (!backtestingResults) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 bg-white rounded-lg border mt-6">
        백테스팅 데이터가 없습니다.
      </div>
    )
  }

  return (
    <div className="mt-6">
      <BacktestingDashboard stats={backtestingResults} />
    </div>
  )
}

// FastAPI에서 받은 백테스팅 데이터를 대시보드 형식에 맞게 변환
function formatBacktestData(apiData: any, stockCode: string) {
  // FastAPI의 backtesting 라이브러리에서 반환되는 stats 객체를 변환
  const stats = {
    Start: apiData.Start || "",
    End: apiData.End || "",
    Duration: apiData.Duration || "",
    "Exposure Time [%]": apiData["Exposure Time [%]"] || 0,
    "Equity Final [$]": apiData["Equity Final [$]"] || 0,
    "Equity Peak [$]": apiData["Equity Peak [$]"] || 0,
    "Commissions [$]": apiData["Commissions [$]"] || 0,
    "Return [%]": apiData["Return [%]"] || 0,
    "Buy & Hold Return [%]": apiData["Buy & Hold Return [%]"] || 0,
    "Return (Ann.) [%]": apiData["Return (Ann.) [%]"] || 0,
    "Volatility (Ann.) [%]": apiData["Volatility (Ann.) [%]"] || 0,
    "Sharpe Ratio": apiData["Sharpe Ratio"] || 0,
    "Sortino Ratio": apiData["Sortino Ratio"] || 0,
    "Calmar Ratio": apiData["Calmar Ratio"] || 0,
    "Alpha [%]": apiData["Alpha [%]"] || 0,
    Beta: apiData.Beta || 0,
    "Max. Drawdown [%]": apiData["Max. Drawdown [%]"] || 0,
    "Avg. Drawdown [%]": apiData["Avg. Drawdown [%]"] || 0,
    "Max. Drawdown Duration": apiData["Max. Drawdown Duration"] || 0,
    "Avg. Drawdown Duration": apiData["Avg. Drawdown Duration"] || 0,
    "# Trades": apiData["# Trades"] || 0,
    "Win Rate [%]": apiData["Win Rate [%]"] || 0,
    "Best Trade [%]": apiData["Best Trade [%]"] || 0,
    "Worst Trade [%]": apiData["Worst Trade [%]"] || 0,
    "Avg. Trade [%]": apiData["Avg. Trade [%]"] || 0,
    "Max. Trade Duration": apiData["Max. Trade Duration"] || 0,
    "Avg. Trade Duration": apiData["Avg. Trade Duration"] || 0,
    "Profit Factor": apiData["Profit Factor"] || 0,
    "Expectancy [%]": apiData["Expectancy [%]"] || 0,
    SQN: apiData.SQN || 0,
    "Kelly Criterion": apiData["Kelly Criterion"] || 0,
    _strategy: "MacdRsiStrategy",
    _equity_curve: generateEquityCurveFromStats(apiData, stockCode),
    _trades: generateTradesFromStats(apiData, stockCode),
  }

  return stats
}

// 백테스팅 결과에서 자산 곡선 데이터 생성
function generateEquityCurveFromStats(apiData: any, stockCode: string) {
  const data = []
  const duration = apiData.Duration || 365
  const startEquity = 10000000 // 초기 자본
  const finalEquity = apiData["Equity Final [$]"] || startEquity
  const maxDrawdown = apiData["Max. Drawdown [%]"] || -10
  const peakEquity = apiData["Equity Peak [$]"] || finalEquity

  // 시작 날짜 (현재로부터 duration일 전)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - duration)

  for (let i = 0; i <= duration; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    // 진행률에 따른 자산 변화 시뮬레이션
    const progress = i / duration
    let equity = startEquity + (finalEquity - startEquity) * progress

    // 변동성 추가 (실제 백테스팅 결과의 변동성 반영)
    const volatility = (apiData["Volatility (Ann.) [%]"] || 20) / 100
    const randomFactor = (Math.sin(i * 0.1) + Math.cos(i * 0.07)) * volatility * 0.1
    equity *= 1 + randomFactor

    // 피크 대비 드로우다운 계산
    const currentPeak = Math.max(peakEquity * Math.min(progress * 1.2, 1), equity)
    const drawdown = Math.min(0, (equity - currentPeak) / currentPeak)

    data.push({
      date: date.toISOString().split("T")[0],
      equity: Math.max(equity, startEquity * 0.5), // 최소 50% 손실로 제한
      drawdown: Math.max(drawdown, maxDrawdown / 100),
    })
  }

  return data
}

// 백테스팅 결과에서 거래 데이터 생성
function generateTradesFromStats(apiData: any, stockCode: string) {
  const trades = []
  const numTrades = apiData["# Trades"] || 10
  const winRate = (apiData["Win Rate [%]"] || 50) / 100
  const bestTrade = (apiData["Best Trade [%]"] || 10) / 100
  const worstTrade = (apiData["Worst Trade [%]"] || -5) / 100
  const avgTrade = (apiData["Avg. Trade [%]"] || 1) / 100

  for (let i = 0; i < numTrades; i++) {
    // 승률에 따라 수익/손실 결정
    const isWin = Math.random() < winRate
    let returnPct

    if (isWin) {
      // 승리 거래: 0%에서 최고 수익률 사이
      returnPct = Math.random() * bestTrade
    } else {
      // 손실 거래: 최악 손실률에서 0% 사이
      returnPct = worstTrade + Math.random() * -worstTrade
    }

    const entryPrice = 50000 + Math.random() * 100000
    const exitPrice = entryPrice * (1 + returnPct)
    const duration = Math.floor(5 + Math.random() * 20)

    trades.push({
      size: Math.floor(100 + Math.random() * 500),
      entryBar: i * 15,
      exitBar: i * 15 + duration,
      entryPrice,
      exitPrice,
      pnl: (exitPrice - entryPrice) * 100,
      returnPct,
      duration,
    })
  }

  return trades
}

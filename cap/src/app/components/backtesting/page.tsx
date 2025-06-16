"use client"
import BacktestingDashboard from "../backtestingGraph/BacktestingDashboard"

// 샘플 데이터 (실제로는 백테스팅 API에서 받아올 데이터)
const sampleStats = {
  Start: 0.0,
  End: 1828.0,
  Duration: 1828.0,
  "Exposure Time [%]": 49.64461,
  "Equity Final [$]": 10274864.18,
  "Equity Peak [$]": 15689940.48,
  "Commissions [$]": 663335.82,
  "Return [%]": 2.74864,
  "Buy & Hold Return [%]": 10.98176,
  "Return (Ann.) [%]": 0.0,
  "Volatility (Ann.) [%]": Number.NaN,
  "Sharpe Ratio": Number.NaN,
  "Sortino Ratio": Number.NaN,
  "Calmar Ratio": 0.0,
  "Alpha [%]": -2.43988,
  Beta: 0.47247,
  "Max. Drawdown [%]": -35.19888,
  "Avg. Drawdown [%]": -7.70954,
  "Max. Drawdown Duration": 1085.0,
  "Avg. Drawdown Duration": 135.53846,
  "# Trades": 30.0,
  "Win Rate [%]": 36.66667,
  "Best Trade [%]": 37.89649,
  "Worst Trade [%]": -6.99677,
  "Avg. Trade [%]": 0.45323,
  "Max. Trade Duration": 115.0,
  "Avg. Trade Duration": 29.26667,
  "Profit Factor": 1.34102,
  "Expectancy [%]": 0.7965,
  SQN: 0.28397,
  "Kelly Criterion": 0.05678,
  _strategy: "SmaCross",
  _equity_curve: generateSampleEquityCurve(),
  _trades: generateSampleTrades(),
}

function generateSampleEquityCurve() {
  const data = []
  const startDate = new Date("2020-01-01")
  const startEquity = 10000000

  for (let i = 0; i < 1828; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    const equity = startEquity * (1 + Math.random() * 0.02 - 0.01 + i * 0.0001)
    const peak = Math.max(...data.map((d) => d.equity), equity)
    const drawdown = (equity - peak) / peak

    data.push({
      date: date.toISOString().split("T")[0],
      equity,
      drawdown,
    })
  }

  return data
}

function generateSampleTrades() {
  const trades = []
  for (let i = 0; i < 30; i++) {
    const entryPrice = 100 + Math.random() * 50
    const exitPrice = entryPrice * (1 + (Math.random() - 0.5) * 0.2)
    const returnPct = (exitPrice - entryPrice) / entryPrice

    trades.push({
      size: Math.floor(Math.random() * 1000) + 100,
      entryBar: i * 60,
      exitBar: i * 60 + Math.floor(Math.random() * 100) + 10,
      entryPrice,
      exitPrice,
      pnl: (exitPrice - entryPrice) * 100,
      returnPct,
      duration: Math.floor(Math.random() * 100) + 10,
    })
  }
  return trades
}

export default function BacktestingPage() {
  return (
    <div className="container mx-auto p-6">
      <BacktestingDashboard stats={sampleStats} />
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EquityCurveChart from "./EquityCurveChart"
import DrawdownChart from "./DrawdownChart"
import TradeDistributionChart from "./TradeDistributionChart"
import PerformanceMetrics from "./PerformanceMetrics"
import MonthlyReturnsHeatmap from "./MonthlyReturnsHeatmap"

type BacktestStats = {
  Start: number
  End: number
  Duration: number
  "Exposure Time [%]": number
  "Equity Final [$]": number
  "Equity Peak [$]": number
  "Commissions [$]": number
  "Return [%]": number
  "Buy & Hold Return [%]": number
  "Return (Ann.) [%]": number
  "Volatility (Ann.) [%]": number
  "Sharpe Ratio": number
  "Sortino Ratio": number
  "Calmar Ratio": number
  "Alpha [%]": number
  Beta: number
  "Max. Drawdown [%]": number
  "Avg. Drawdown [%]": number
  "Max. Drawdown Duration": number
  "Avg. Drawdown Duration": number
  "# Trades": number
  "Win Rate [%]": number
  "Best Trade [%]": number
  "Worst Trade [%]": number
  "Avg. Trade [%]": number
  "Max. Trade Duration": number
  "Avg. Trade Duration": number
  "Profit Factor": number
  "Expectancy [%]": number
  SQN: number
  "Kelly Criterion": number
  _strategy: string
  _equity_curve: Array<{ date: string; equity: number; drawdown: number }>
  _trades: Array<{
    size: number
    entryBar: number
    exitBar: number
    entryPrice: number
    exitPrice: number
    pnl: number
    returnPct: number
    duration: number
  }>
}

type Props = {
  stats: BacktestStats
  priceData?: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>
}

export default function BacktestingDashboard({ stats, priceData }: Props) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">백테스팅 결과</h2>
          <p className="text-slate-600">전략: {stats._strategy}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">기간</div>
          <div className="font-medium">{stats.Duration}일</div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="equity">자산곡선</TabsTrigger>
          <TabsTrigger value="drawdown">손실분석</TabsTrigger>
          <TabsTrigger value="trades">거래분석</TabsTrigger>
          <TabsTrigger value="returns">수익률</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PerformanceMetrics stats={stats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>자산 곡선</CardTitle>
              </CardHeader>
              <CardContent>
                <EquityCurveChart data={stats._equity_curve} height={300} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>드로우다운</CardTitle>
              </CardHeader>
              <CardContent>
                <DrawdownChart data={stats._equity_curve} height={300} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="equity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>자산 곡선 상세</CardTitle>
            </CardHeader>
            <CardContent>
              <EquityCurveChart data={stats._equity_curve} height={500} showBenchmark />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drawdown" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>드로우다운 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <DrawdownChart data={stats._equity_curve} height={400} detailed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>거래 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <TradeDistributionChart trades={stats._trades} height={400} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>월별 수익률</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyReturnsHeatmap data={stats._equity_curve} height={300} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

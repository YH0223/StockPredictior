"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, AlertTriangle } from "lucide-react"

type BacktestStats = {
  "Return [%]": number
  "Buy & Hold Return [%]": number
  "Sharpe Ratio": number
  "Max. Drawdown [%]": number
  "Win Rate [%]": number
  "# Trades": number
  "Equity Final [$]": number
  "Volatility (Ann.) [%]": number
}

type Props = {
  stats: BacktestStats
}

export default function PerformanceMetrics({ stats }: Props) {
  const metrics = [
    {
      title: "총 수익률",
      value: `${stats["Return [%]"].toFixed(2)}%`,
      icon: stats["Return [%]"] >= 0 ? TrendingUp : TrendingDown,
      color: stats["Return [%]"] >= 0 ? "text-emerald-600" : "text-red-600",
      bgColor: stats["Return [%]"] >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
    {
      title: "샤프 비율",
      value: isNaN(stats["Sharpe Ratio"]) ? "N/A" : stats["Sharpe Ratio"].toFixed(2),
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "최대 손실",
      value: `${stats["Max. Drawdown [%]"].toFixed(2)}%`,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "승률",
      value: `${stats["Win Rate [%]"].toFixed(1)}%`,
      icon: Percent,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "총 거래 수",
      value: stats["# Trades"].toString(),
      icon: Target,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
    },
    {
      title: "최종 자산",
      value: `$${stats["Equity Final [$]"].toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 truncate">{metric.title}</p>
                  <p className={`text-sm font-semibold ${metric.color} truncate`}>{metric.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

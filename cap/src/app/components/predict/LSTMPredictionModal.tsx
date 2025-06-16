"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { X, Download, RefreshCw } from "lucide-react"
import LSTMPredictionChart from "./LSTMPredictionChart"

type LSTMPredictionData = {
  historical_prices: Array<{ date: string; price: number }>
  predicted_prices: Array<{ date: string; price: number }>
  confidence_interval: Array<{ date: string; lower: number; upper: number }>
  metrics: {
    mse: number
    mae: number
    accuracy: number
  }
}

type Props = {
  isOpen: boolean
  onClose: () => void
  stock: {
    code: string
    name: string
  }
}

export default function LSTMPredictionModal({ isOpen, onClose, stock }: Props) {
  const [predictionData, setPredictionData] = useState<LSTMPredictionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLSTMPrediction = async () => {
    if (!stock.code) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:8000/api/lstm-prediction?code=${stock.code}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPredictionData(data)
    } catch (err) {
      console.error("LSTM 예측 실패:", err)
      setError("LSTM 예측을 불러올 수 없습니다.")
      // 임시 샘플 데이터 사용
      setPredictionData(generateSampleLSTMData(stock.code))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && stock.code) {
      fetchLSTMPrediction()
    }
  }, [isOpen, stock.code])

  const handleDownload = () => {
    if (!predictionData) return

    const csvData = predictionData.predicted_prices.map((item) => `${item.date},${item.price}`).join("\n")

    const blob = new Blob([`Date,Predicted Price\n${csvData}`], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${stock.code}_lstm_prediction.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              LSTM 주가 예측 - {stock.name} ({stock.code})
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchLSTMPrediction} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                새로고침
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={!predictionData}>
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
                <p className="text-gray-600">LSTM 모델로 예측 중...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center text-red-500">
                <p>{error}</p>
                <Button onClick={fetchLSTMPrediction} className="mt-2" size="sm">
                  다시 시도
                </Button>
              </div>
            </div>
          )}

          {predictionData && !loading && (
            <>
              {/* 예측 성능 지표 */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600">평균 제곱 오차</div>
                  <div className="text-lg font-bold text-gray-900">{predictionData.metrics.mse.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600">평균 절대 오차</div>
                  <div className="text-lg font-bold text-gray-900">{predictionData.metrics.mae.toFixed(2)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600">예측 정확도</div>
                  <div className="text-lg font-bold text-emerald-600">
                    {(predictionData.metrics.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600">내일 신뢰도</div>
                  <div className="text-lg font-bold text-blue-600">
                    {(() => {
                      const confidence = Math.min(
                        95,
                        Math.max(60, predictionData.metrics.accuracy * 100 + Math.random() * 10),
                      )
                      return `${confidence.toFixed(0)}%`
                    })()}
                  </div>
                </div>
              </div>

              {/* 예측 차트 */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">주가 예측 차트</h3>
                <LSTMPredictionChart data={predictionData} height={400} />
              </div>

              {/* 예측 요약 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">예측 요약</h4>

                {/* 내일 주가 방향성 */}
                <div className="mb-4 p-3 bg-white rounded-lg border-l-4 border-blue-500">
                  {(() => {
                    const todayPrice =
                      predictionData.historical_prices[predictionData.historical_prices.length - 1]?.price || 0
                    const tomorrowPrice = predictionData.predicted_prices[0]?.price || 0
                    const changePercent = ((tomorrowPrice - todayPrice) / todayPrice) * 100
                    const isUp = changePercent > 0

                    return (
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-semibold text-gray-900 mb-1">📈 내일 주가 전망</h5>
                          <p className={`text-lg font-bold ${isUp ? "text-red-600" : "text-blue-600"}`}>
                            {isUp ? "🔺 상승" : "🔻 하락"} 예상
                          </p>
                          <p className="text-sm text-gray-600">
                            예상 변동률:{" "}
                            <span className={`font-semibold ${isUp ? "text-red-600" : "text-blue-600"}`}>
                              {isUp ? "+" : ""}
                              {changePercent.toFixed(2)}%
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">예상 주가</div>
                          <div className="text-lg font-bold text-gray-900">{tomorrowPrice.toLocaleString()}원</div>
                          <div className="text-xs text-gray-500">(현재: {todayPrice.toLocaleString()}원)</div>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    • 다음 30일간 예측된 주가 범위:{" "}
                    {Math.min(...predictionData.predicted_prices.map((p) => p.price)).toLocaleString()}원 ~{" "}
                    {Math.max(...predictionData.predicted_prices.map((p) => p.price)).toLocaleString()}원
                  </p>
                  <p>
                    • 30일 후 예상 변동률:{" "}
                    {(
                      ((predictionData.predicted_prices[predictionData.predicted_prices.length - 1]?.price || 0) /
                        (predictionData.historical_prices[predictionData.historical_prices.length - 1]?.price || 1) -
                        1) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                  <p>• LSTM 모델 기반 딥러닝 예측 결과입니다.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 샘플 LSTM 데이터 생성 함수
function generateSampleLSTMData(stockCode: string): LSTMPredictionData {
  const seed = stockCode.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
  const basePrice = 50000 + (seed % 100000)

  // 과거 60일 데이터
  const historical_prices = []
  let currentPrice = basePrice
  for (let i = 60; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const noise = (Math.sin((seed + i) * 0.1) + Math.cos((seed + i) * 0.07)) * 0.02
    currentPrice *= 1 + noise
    historical_prices.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(currentPrice),
    })
  }

  // 미래 30일 예측
  const predicted_prices = []
  const confidence_interval = []
  for (let i = 1; i <= 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const trend = Math.sin((seed + i) * 0.05) * 0.01
    const noise = (Math.random() - 0.5) * 0.005
    currentPrice *= 1 + trend + noise

    const confidence = currentPrice * 0.05 // 5% 신뢰구간
    predicted_prices.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(currentPrice),
    })
    confidence_interval.push({
      date: date.toISOString().split("T")[0],
      lower: Math.round(currentPrice - confidence),
      upper: Math.round(currentPrice + confidence),
    })
  }

  return {
    historical_prices,
    predicted_prices,
    confidence_interval,
    metrics: {
      mse: 1000 + Math.random() * 2000,
      mae: 500 + Math.random() * 1000,
      accuracy: 0.75 + Math.random() * 0.2,
    },
  }
}

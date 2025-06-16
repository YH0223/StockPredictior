"use client"
import { useState } from "react"
import BackTest from "./BackTest"
import LSTMPredictionModal from "./LSTMPredictionModal"
import { Button } from "../../components/ui/button"
import { TrendingUp } from "lucide-react"

type PredictionResultType = {
  result: number
  risk?: string
  recommendation?: string
}

type Props = {
  stock: {
    code: string
    name: string
  }
  predictionResult: PredictionResultType | null
}

export default function PredictionResult({ stock, predictionResult }: Props) {
  const [isLSTMModalOpen, setIsLSTMModalOpen] = useState(false)

  if (!stock.code) {
    return <div className="flex items-center justify-center h-full text-gray-500">종목을 선택해주세요.</div>
  }

  if (!predictionResult) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        예측 결과가 없습니다. 예측을 실행하세요.
      </div>
    )
  }

  const quantScore = typeof predictionResult.result === "number" ? predictionResult.result.toFixed(4) : "N/A"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">예측 결과</h2>
        <Button
          onClick={() => setIsLSTMModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
          size="sm"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          LSTM 예측
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 border border-gray-200 flex flex-col gap-4 text-base">
        <div>
          <span className="font-semibold text-gray-600">종목명: </span>
          <span>
            {stock.name} ({stock.code})
          </span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">퀀트 점수: </span>
          <span className="text-green-600 font-bold">{quantScore}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">리스크 지수: </span>
          <span className="text-red-500 font-bold">{predictionResult.risk ?? "N/A"}</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">추천 여부: </span>
          <span className="text-blue-500 font-bold">{predictionResult.recommendation ?? "N/A"}</span>
        </div>
      </div>

      {/* 백테스팅 컴포넌트 */}
      <BackTest stock={stock} />

      {/* LSTM 예측 모달 */}
      <LSTMPredictionModal isOpen={isLSTMModalOpen} onClose={() => setIsLSTMModalOpen(false)} stock={stock} />
    </div>
  )
}

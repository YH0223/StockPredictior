"use client"

type Row = {
  code: string
  name: string
  score: number | string
  risk?: string
  recommendation?: string
}
type Props = {
  data: Row[]
  loading: boolean
  onSelect: (code: string, name: string) => void
  selectedCode?: string
}

export default function PredictionTable({ data, loading, onSelect, selectedCode }: Props) {
  if (loading) return <div className="text-center py-6 text-slate-600">예측 중...</div>
  if (!data?.length) return <div className="text-center text-slate-400 py-6">관심종목 예측 데이터 없음</div>

  return (
    <div className="space-y-2">
      {data.map((row) => (
        <div
          key={row.code}
          className={`
            p-3 border border-slate-200 rounded-md cursor-pointer transition-colors text-sm
            hover:bg-slate-50 hover:border-slate-300
            ${selectedCode === row.code ? "bg-emerald-50 border-emerald-300" : "bg-white"}
          `}
          onClick={() => onSelect(row.code, row.name)}
        >
          <div className="flex items-center justify-between">
            <div className="font-medium text-slate-900">{row.name}</div>
            <div className="font-bold text-emerald-600">{row.score}</div>
          </div>
          <div className="flex items-center justify-between mt-1 text-xs">
            <div className="text-red-500">{row.risk ?? "-"}</div>
            <div className="text-blue-600">{row.recommendation ?? "-"}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// 리디자인된 PredictModelPage.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import supabase from "../../lib/supabase"
import { useRouter } from "next/navigation"
import Watchlist from "@/app/components/Watchlist"
import PredictionTable from "@/app/components/predict/PredictionTable"
import PredictionResult from "@/app/components/predict/PredictionResult"
import { LogOut, User, TrendingUp, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip"
import {
  BrainCircuit,
  BarChart3,
} from "lucide-react"
type PredictionResultType = {
    result: number
    risk?: string
    recommendation?: string
  }
const HEADER_HEIGHT = "h-20" // 80px
const BASE_URL="http://localhost:8000" 
const PredictModelPage = () => {
  const [user, setUser] = useState<any>(null)
  const [selectedStock, setSelectedStock] = useState({
    code: "005930",
    name: "삼성전자",
  })
  const [selectedFactors, setSelectedFactors] = useState<string[]>([])
  const [priceMap, setPriceMap] = useState<Record<string, any>>({})
  const [query, setQuery] = useState<string>("")
  const [companies, setCompanies] = useState<{ code: string; name: string }[]>([])
  const [filtered, setFiltered] = useState<{ code: string; name: string }[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchWrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedModelNum, setSelectedModelNum] = useState<number>(1)
  const [watchlistCodes, setWatchlistCodes] = useState<string[]>([]);
  const [watchlistData, setWatchlistData] = useState<any[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResultType | null>(null);


  useEffect(() => {
    if (!selectedStock.code) {
      setPredictionResult(null);
      return;
    }
    setLoading(true);
    fetch(BASE_URL + '/api/prediction', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: selectedStock.code,
        model_number: selectedModelNum,
      }),
    })
      .then(res => res.json())
      .then(data => setPredictionResult(data))
      .catch(() => setPredictionResult({ error: "예측 실패" }))
      .finally(() => setLoading(false));
  }, [selectedStock, selectedModelNum]);
  

  useEffect(() => {
    if (!watchlistCodes.length) {
      setWatchlistData([]);
      return;
    }
    setBatchLoading(true);
    fetch(BASE_URL + "/api/prediction/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codes: watchlistCodes, model_number: selectedModelNum }),
    })
      .then(res => res.json())
      .then(json => setWatchlistData(json.data || []))
      .catch(() => setWatchlistData([]))
      .finally(() => setBatchLoading(false));
  }, [watchlistCodes]); 

  
  

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
      } else {
        setUser(session.user)
      }
    }
    fetchSession()
  }, [router])

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await fetch('http://localhost:8000/api/company')
      const json = await res.json()
      console.log('API 데이터:', json.data) // 여기를 추가!
      setCompanies(json.data || [])
    }
    fetchCompanies()
  }, [])


  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  useEffect(() => {
    if (!companies.length) return;
    // 검색어 없으면 전체 표시(또는 비우기, 원하는 대로)
    if (!query.trim()) {
      setFiltered([]);
      setShowDropdown(false);
      return;
    }
    const q = query.trim().toLowerCase();
    // code가 숫자일 경우 대비
    const filteredList = companies.filter(c =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      String(c.code).includes(q)
    );
    setFiltered(filteredList);
    setShowDropdown(true);
    // 디버깅용
    console.log("검색 query:", query, "Filtered:", filteredList);
  }, [query, companies]);


  

  if (!user) return null

  return (
    <div className="flex h-screen bg-white text-slate-900 relative overflow-hidden">
      {/* Left sidebar - Watchlist */}
      <div className="w-80 bg-white flex flex-col">
        <div className={`flex items-center gap-3 px-4 border-b border-slate-200 bg-white ${HEADER_HEIGHT}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center border border-emerald-400/20 rounded-none">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-yellow-400 bg-clip-text text-transparent tracking-tight">
              StockPredictor
            </h1>
            <p className="text-xs text-slate-400">스마트한 투자의 시작</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
       
        <Watchlist
            selectedStock={selectedStock}
            onStockSelect={setSelectedStock}
            userId={user.id}
            priceMap={priceMap}
            setPriceMap={setPriceMap}
            onWatchlistChange={codes => setWatchlistCodes(codes)}
        />
        
        </div>
        <div className="p-3 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 flex items-center justify-center rounded-none">
                <User className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-slate-800 truncate">{user.email}</p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-emerald-400 rounded-none"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>로그아웃</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col bg-white">
        {/* 메인 헤더 */}
        <div className={`border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-8 z-10 ${HEADER_HEIGHT}`}>
          {/* 중앙 검색 */}
          <div className="flex-1 flex items-center" ref={searchWrapperRef} style={{ marginLeft: "350px" }}>
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="종목명 or 코드 검색..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                ref={searchInputRef}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-[16px] text-slate-900 placeholder:text-slate-400 rounded-none"
                autoComplete="off"
              />
              {showDropdown && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-lg max-h-72 overflow-y-auto z-50 rounded-none">
                  {filtered.map(company => (
                    <div
                      key={company.code}
                      onClick={() => {
                        setSelectedStock({ code: company.code, name: company.name })
                        setQuery("")
                        setShowDropdown(false)
                        searchInputRef.current?.blur()
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0 rounded-none"
                    >
                      <div className="font-medium text-slate-900">{company.name}</div>
                      <div className="text-xs text-slate-400">{company.code}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-emerald-400 rounded-none"
                onClick={() => router.push("/")}
              >
                <BarChart3 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-emerald-400 rounded-none"
                onClick={() => router.push("/predict")}
              >
                <BrainCircuit className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          {/* 왼쪽: 팩터 필터 */}
          <div className="w-full lg:w-[380px] xl:w-[420px] min-w-[280px] border-b lg:border-b-0 lg:border-r border-slate-200 p-4 bg-white flex flex-col">
            {/* 예측 테이블 추가 */}
                <PredictionTable
                data={watchlistData}
                loading={batchLoading}
                onSelect={(code, name) => setSelectedStock({ code, name })}
                selectedCode={selectedStock.code}
                />

                            
          </div>

          {/* 중앙: 예측 결과 */}
          <div className="flex-1 p-4 bg-white overflow-y-auto">
          <PredictionResult
            stock={selectedStock}
            predictionResult={predictionResult}
            />
            
          </div>
        
        </div>
      </main>
    </div>
  )
}

export default PredictModelPage
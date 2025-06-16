"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

type Trade = {
  size: number
  entryBar: number
  exitBar: number
  entryPrice: number
  exitPrice: number
  pnl: number
  returnPct: number
  duration: number
}

type Props = {
  trades: Trade[]
  height?: number
}

export default function TradeDistributionChart({ trades, height = 400 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!trades || !trades.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const width = 800 - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // 히스토그램 데이터 준비
    const returns = trades.map((t) => t.returnPct)
    const bins = d3
      .histogram()
      .domain(d3.extent(returns) as [number, number])
      .thresholds(20)(returns)

    // 스케일 설정
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(returns) as [number, number])
      .nice()
      .range([0, width])

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length) || 0])
      .nice()
      .range([chartHeight, 0])

    // 바 그리기
    g.selectAll(".bar")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.x0 || 0))
      .attr("width", (d) => Math.max(0, xScale(d.x1 || 0) - xScale(d.x0 || 0) - 1))
      .attr("y", (d) => yScale(d.length))
      .attr("height", (d) => chartHeight - yScale(d.length))
      .attr("fill", (d) => ((d.x0 || 0) >= 0 ? "#10b981" : "#ef4444"))
      .attr("opacity", 0.7)

    // 축
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat((d) => `${d3.format(".1%")(d as number)}`))

    g.append("g").call(d3.axisLeft(yScale))

    // 축 레이블
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - chartHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("거래 수")

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${chartHeight + margin.bottom})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("수익률 (%)")

    // 평균선
    const avgReturn = d3.mean(returns) || 0
    g.append("line")
      .attr("x1", xScale(avgReturn))
      .attr("x2", xScale(avgReturn))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
  }, [trades, height])

  return <svg ref={svgRef} width="100%" height={height} className="overflow-visible" />
}

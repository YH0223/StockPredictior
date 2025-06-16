"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

type LSTMPredictionData = {
  historical_prices: Array<{ date: string; price: number }>
  predicted_prices: Array<{ date: string; price: number }>
  confidence_interval: Array<{ date: string; lower: number; upper: number }>
}

type Props = {
  data: LSTMPredictionData
  height?: number
}

export default function LSTMPredictionChart({ data, height = 400 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 80 }
    const width = 800 - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // 데이터 파싱
    const parseDate = d3.timeParse("%Y-%m-%d")
    const allData = [
      ...data.historical_prices.map((d) => ({ ...d, date: parseDate(d.date)!, type: "historical" })),
      ...data.predicted_prices.map((d) => ({ ...d, date: parseDate(d.date)!, type: "predicted" })),
    ]

    const confidenceData = data.confidence_interval.map((d) => ({
      ...d,
      date: parseDate(d.date)!,
    }))

    // 스케일 설정
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(allData, (d) => d.date) as [Date, Date])
      .range([0, width])

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(allData, (d) => d.price) as [number, number])
      .nice()
      .range([chartHeight, 0])

    // 그리드 라인
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-chartHeight)
          .tickFormat(() => ""),
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)

    g.append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => ""),
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)

    // 신뢰구간 영역
    const area = d3
      .area<(typeof confidenceData)[0]>()
      .x((d) => xScale(d.date))
      .y0((d) => yScale(d.lower))
      .y1((d) => yScale(d.upper))
      .curve(d3.curveMonotoneX)

    g.append("path").datum(confidenceData).attr("fill", "#3b82f6").attr("fill-opacity", 0.2).attr("d", area)

    // 과거 데이터 라인
    const historicalLine = d3
      .line<(typeof allData)[0]>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.price))
      .curve(d3.curveMonotoneX)

    const historicalData = allData.filter((d) => d.type === "historical")
    g.append("path")
      .datum(historicalData)
      .attr("fill", "none")
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 2)
      .attr("d", historicalLine)

    // 예측 데이터 라인
    const predictedData = allData.filter((d) => d.type === "predicted")
    g.append("path")
      .datum(predictedData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .attr("d", historicalLine)

    // 현재 시점 구분선
    const today = new Date()
    g.append("line")
      .attr("x1", xScale(today))
      .attr("x2", xScale(today))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3")

    // 축
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%m/%d")))

    g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `${d3.format(",.0f")(d as number)}원`))

    // 범례
    const legend = g.append("g").attr("transform", `translate(${width - 150}, 20)`)

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 2)

    legend.append("text").attr("x", 25).attr("y", 5).style("font-size", "12px").text("과거 데이터")

    legend
      .append("line")
      .attr("x1", 0)
      .attr("x2", 20)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")

    legend.append("text").attr("x", 25).attr("y", 25).style("font-size", "12px").text("LSTM 예측")

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 35)
      .attr("width", 20)
      .attr("height", 10)
      .attr("fill", "#3b82f6")
      .attr("fill-opacity", 0.2)

    legend.append("text").attr("x", 25).attr("y", 45).style("font-size", "12px").text("신뢰구간")

    // 축 레이블
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - chartHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("주가 (원)")

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${chartHeight + margin.bottom})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("날짜")
  }, [data, height])

  return <svg ref={svgRef} width="100%" height={height} className="overflow-visible" />
}

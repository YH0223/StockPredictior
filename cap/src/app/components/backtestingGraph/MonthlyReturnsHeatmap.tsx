"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

type EquityData = {
  date: string
  equity: number
  drawdown: number
}

type Props = {
  data: EquityData[]
  height?: number
}

export default function MonthlyReturnsHeatmap({ data, height = 300 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 40, right: 30, bottom: 40, left: 60 }
    const width = 800 - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // 월별 수익률 계산
    const parseDate = d3.timeParse("%Y-%m-%d")
    const monthlyReturns: { [key: string]: number } = {}

    for (let i = 1; i < data.length; i++) {
      const currentDate = parseDate(data[i].date)
      const prevDate = parseDate(data[i - 1].date)

      if (currentDate && prevDate) {
        const monthKey = d3.timeFormat("%Y-%m")(currentDate)
        const returnPct = (data[i].equity - data[i - 1].equity) / data[i - 1].equity

        if (!monthlyReturns[monthKey]) {
          monthlyReturns[monthKey] = 0
        }
        monthlyReturns[monthKey] += returnPct
      }
    }

    const monthlyData = Object.entries(monthlyReturns).map(([month, returns]) => ({
      month,
      returns,
      year: month.split("-")[0],
      monthNum: Number.parseInt(month.split("-")[1]),
    }))

    const years = [...new Set(monthlyData.map((d) => d.year))].sort()
    const months = Array.from({ length: 12 }, (_, i) => i + 1)

    // 스케일 설정
    const xScale = d3.scaleBand().domain(months.map(String)).range([0, width]).padding(0.1)

    const yScale = d3.scaleBand().domain(years).range([0, chartHeight]).padding(0.1)

    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain(d3.extent(monthlyData, (d) => d.returns) as [number, number])

    // 히트맵 셀
    g.selectAll(".cell")
      .data(monthlyData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xScale(d.monthNum.toString()) || 0)
      .attr("y", (d) => yScale(d.year) || 0)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.returns))
      .attr("stroke", "white")
      .attr("stroke-width", 1)

    // 텍스트 레이블
    g.selectAll(".text")
      .data(monthlyData)
      .enter()
      .append("text")
      .attr("class", "text")
      .attr("x", (d) => (xScale(d.monthNum.toString()) || 0) + xScale.bandwidth() / 2)
      .attr("y", (d) => (yScale(d.year) || 0) + yScale.bandwidth() / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", "10px")
      .style("fill", (d) => (Math.abs(d.returns) > 0.05 ? "white" : "black"))
      .text((d) => `${(d.returns * 100).toFixed(1)}%`)

    // 축
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat((d) => ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"][+d - 1]),
      )

    g.append("g").call(d3.axisLeft(yScale))

    // 축 레이블
    g.append("text")
      .attr("transform", `translate(${width / 2}, ${chartHeight + margin.bottom})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("월")

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - chartHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("연도")
  }, [data, height])

  return <svg ref={svgRef} width="100%" height={height} className="overflow-visible" />
}

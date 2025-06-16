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
  detailed?: boolean
}

export default function DrawdownChart({ data, height = 300, detailed = false }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || !data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const width = 800 - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // 데이터 파싱
    const parseDate = d3.timeParse("%Y-%m-%d")
    const parsedData = data.map((d) => ({
      ...d,
      date: parseDate(d.date) || new Date(),
    }))

    // 스케일 설정
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.date) as [Date, Date])
      .range([0, width])

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(parsedData, (d) => d.drawdown) || 0, 0])
      .nice()
      .range([chartHeight, 0])

    // 영역 생성기
    const area = d3
      .area<(typeof parsedData)[0]>()
      .x((d) => xScale(d.date))
      .y0(yScale(0))
      .y1((d) => yScale(d.drawdown))
      .curve(d3.curveMonotoneX)

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

    // 드로우다운 영역
    g.append("path").datum(parsedData).attr("fill", "#ef4444").attr("fill-opacity", 0.3).attr("d", area)

    // 드로우다운 라인
    const line = d3
      .line<(typeof parsedData)[0]>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.drawdown))
      .curve(d3.curveMonotoneX)

    g.append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("d", line)

    // 축
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m")))

    g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `${d3.format(".1%")(d as number)}`))

    // 축 레이블
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - chartHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("드로우다운 (%)")

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${chartHeight + margin.bottom})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("날짜")
  }, [data, height, detailed])

  return <svg ref={svgRef} width="100%" height={height} className="overflow-visible" />
}

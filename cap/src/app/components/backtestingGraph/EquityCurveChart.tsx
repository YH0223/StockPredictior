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
  showBenchmark?: boolean
}

export default function EquityCurveChart({ data, height = 400, showBenchmark = false }: Props) {
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
      .domain(d3.extent(parsedData, (d) => d.equity) as [number, number])
      .nice()
      .range([chartHeight, 0])

    // 라인 생성기
    const line = d3
      .line<(typeof parsedData)[0]>()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.equity))
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

    // 자산 곡선
    g.append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("d", line)

    // 벤치마크 (Buy & Hold) 라인
    if (showBenchmark) {
      const benchmarkData = parsedData.map((d, i) => ({
        ...d,
        equity: parsedData[0].equity * (1 + (i / parsedData.length) * 0.1098176), // Buy & Hold Return 사용
      }))

      const benchmarkLine = d3
        .line<(typeof benchmarkData)[0]>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.equity))
        .curve(d3.curveMonotoneX)

      g.append("path")
        .datum(benchmarkData)
        .attr("fill", "none")
        .attr("stroke", "#6b7280")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,5")
        .attr("d", benchmarkLine)
    }

    // 축
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m")))

    g.append("g").call(d3.axisLeft(yScale).tickFormat((d) => `$${d3.format(",.0f")(d as number)}`))

    // 축 레이블
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - chartHeight / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("자산 ($)")

    g.append("text")
      .attr("transform", `translate(${width / 2}, ${chartHeight + margin.bottom})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#6b7280")
      .text("날짜")

    // 툴팁
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")

    // 마우스 이벤트를 위한 오버레이
    g.append("rect")
      .attr("width", width)
      .attr("height", chartHeight)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => tooltip.style("visibility", "visible"))
      .on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event)
        const date = xScale.invert(mouseX)
        const bisect = d3.bisector((d: (typeof parsedData)[0]) => d.date).left
        const index = bisect(parsedData, date, 1)
        const d = parsedData[index]

        if (d) {
          tooltip
            .html(`날짜: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br/>자산: $${d3.format(",.0f")(d.equity)}`)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px")
        }
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"))

    return () => {
      tooltip.remove()
    }
  }, [data, height, showBenchmark])

  return <svg ref={svgRef} width="100%" height={height} className="overflow-visible" />
}

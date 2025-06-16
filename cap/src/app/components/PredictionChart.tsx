import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface PredictionData {
  date: string;
  prediction: number;
  actual?: number | null; // 실제값이 없을 수도 있음
}

interface PredictionChartProps {
  predictions: PredictionData[];
}

export default function PredictionChart({ predictions }: PredictionChartProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!predictions || predictions.length === 0) return;

    // 날짜 변환
    const data = predictions.map(d => ({
      ...d,
      date: new Date(d.date)
    }));

    // svg 영역 초기화
    d3.select(ref.current).selectAll("*").remove();

    const width = 600, height = 300, margin = { top: 20, right: 20, bottom: 30, left: 50 };

    const svg = d3.select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // X/Y scale
    const dates = data.map(d => d.date as Date);
    const x = d3.scaleTime()
      .domain(dates.length > 0 ? [d3.min(dates)!, d3.max(dates)!] : [new Date(), new Date()])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => Math.min(d.prediction, d.actual ?? d.prediction))!,
        d3.max(data, d => Math.max(d.prediction, d.actual ?? d.prediction))!
      ])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Line generators (제네릭 <typeof data[0]> 지정)
    const linePrediction = d3.line<typeof data[0]>()
      .x(d => x(d.date as Date))
      .y(d => y(d.prediction));

    const lineActual = d3.line<typeof data[0]>()
      .defined(d => d.actual !== null && d.actual !== undefined)
      .x(d => x(d.date as Date))
      .y(d => y(d.actual as number));

    // 예측값 라인
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#0074D9")
      .attr("stroke-width", 2)
      .attr("d", linePrediction as any);

    // 실제값 라인 (존재하는 경우)
    svg.append("path")
      .datum(data.filter(lineActual.defined()))
      .attr("fill", "none")
      .attr("stroke", "#FF4136")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,2")
      .attr("d", lineActual as any);

    // X/Y axis
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat((d) => d3.timeFormat("%m-%d")(d as Date)));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // 범례
    const legend = svg.append("g").attr("transform", `translate(${width - margin.right - 150},${margin.top})`);
    legend.append("rect").attr("x", 0).attr("y", 0).attr("width", 140).attr("height", 40).attr("fill", "#fff").attr("opacity", 0.8);
    legend.append("line").attr("x1", 10).attr("y1", 15).attr("x2", 40).attr("y2", 15).attr("stroke", "#0074D9").attr("stroke-width", 2);
    legend.append("text").attr("x", 45).attr("y", 20).text("예측값").attr("font-size", 13);
    legend.append("line").attr("x1", 10).attr("y1", 30).attr("x2", 40).attr("y2", 30).attr("stroke", "#FF4136").attr("stroke-width", 2).attr("stroke-dasharray", "5,2");
    legend.append("text").attr("x", 45).attr("y", 35).text("실제값").attr("font-size", 13);

  }, [predictions]);

  return <div ref={ref} />;
}

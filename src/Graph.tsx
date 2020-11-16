import React, {useEffect} from "react";
import * as d3 from "d3";
import {DSVParsedArray} from "d3-dsv";
import {UsageEntry} from "./App";
import {utcParse} from "d3";

const margin = {
  top: 70,
  right: 0,
  bottom: 0,
  left: 40,
};

const width = 954;

export default (props: { csvData: DSVParsedArray<UsageEntry> }) => {
  const {csvData} = props;
  useEffect(() => {
    const hourlyData =
      Array.from(
        d3.rollup(
          csvData,
          a => ({usage: d3.sum(a, d => d.usage)}),
          d => {
            return d3.timeFormat("%Y-%m-%dT%H:00")(d.date)
          }
        ),
        ([key, value]) => ({date: d3.timeParse("%Y-%m-%dT%H:%M")(key), ...value})
      )

    console.log(hourlyData)
    const dateExtent = d3.extent(hourlyData, d => d.date);
    const height = margin.top + margin.bottom
      + (d3.timeDay.count(dateExtent[0], dateExtent[1]) + 1) * 10

    const x = d3.scaleBand(d3.range(24), [margin.left, width - margin.right]).round(true)
    const y = d3.scaleBand(d3.timeDays(dateExtent[0], dateExtent[1]), [margin.top, height - margin.bottom]).round(true)

    const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", "white")
      .style("max-width", "954px");

    const [min, max] = d3.extent(hourlyData, d => d.usage);
    const color = d3.scaleSequential([0, max], d3.interpolateReds);

    const formatHour = (d : number) => d === 0 ? "12 AM" : d === 12 ? "12 PM" : (d % 12) + "";

    const formatDay = (d) => {
      const formatMonth = d3.timeFormat("%b %-d");
      const formatDate = d3.timeFormat("%-d");
      return (d.getDate() === 1 ? formatMonth : formatDate)(d);
    }

    const xAxis = g => g
      .attr("transform", `translate(0,${margin.top})`)
      .call(d3.axisTop(x).tickFormat(formatHour))
      .call(g => g.select(".domain").remove())

    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickFormat(formatDay))
      .call(g => g.select(".domain").remove())

    svg.append("g")
      .call(xAxis);

    svg.append("g")
      .call(yAxis);

    const blocks = svg.append("g")
      .selectAll("rect")
      .data(hourlyData)
      .join("rect")
      .attr("x", d => x(d.date.getHours()))
      .attr("y", d => y(d3.timeDay(d.date)))
      .attr("width", x.bandwidth() - 1)
      .attr("height", y.bandwidth() - 1)
      .attr("fill", d => color(d.usage))

    blocks.append("title")
      .text(d => `${d3.timeFormat("%B %-d, %-I %p")(d.date)}
      ${d3.format(".2f")(d.usage)} kW`);

    document.getElementById('yup').appendChild(svg.node())
  }, [])
  return <div id="yup"/>
}
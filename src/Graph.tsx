import React, {useEffect} from "react";
import * as d3 from "d3";
import {DSVParsedArray} from "d3-dsv";
import {UsageEntry} from "./App";

const margin = {
  top: 30,
  left: 30,
  right: 30,
  bottom: 30
}

const width = 954;

export default (props: { csvData: DSVParsedArray<UsageEntry> }) => {
  const {csvData} = props;
  useEffect(() => {
    console.log(props.csvData)
    const extent = d3.extent(csvData, d => d.date);
    const hourlyData = d3.rollup(
      csvData,
      a => d3.sum(a, d => d.usage),
      d => {
        return d3.timeFormat("%Y-%m-%dT%H")(d.date)
      }
    )
    console.log(extent);
    console.log( 'hourly data', hourlyData);
    const height = margin.top + margin.bottom
      + (d3.timeDay.count(extent[0], extent[1]) + 1) * 10
  }, [csvData])
  return <div>yo</div>
}
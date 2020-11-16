import React, {useEffect, useState} from "react";
import {csv, utcParse} from "d3";
import Graph from "./Graph";
import {DSVRowString, DSVParsedArray} from "d3-dsv";

// @ts-ignore
const csvDataUrl = require('../data/pge-electric-data.csv');

type CsvResult =
  | SuccessResult
  | IncompleteResult

type IncompleteResult = {
  status: 'incomplete'
}

type SuccessResult = {
  status: 'success',
  data: DSVParsedArray<UsageEntry>,
}

export type UsageEntry = {
  date: Date,
  usage: number,
}

const parseData = (d : DSVRowString) : UsageEntry => {
  const usage = +(d["USAGE"] || 0);
  const dateString = `${d["DATE"]}T${d["START TIME"]}`;
  const date = utcParse("%Y-%m-%dT%H:%M")(dateString);
  return {
    date: date ||  new Date(0), // this is whack
    usage: usage
  };
}


const usePgeData = () => {
  const [result, setResult] = useState<CsvResult>({status: 'incomplete'});

  useEffect(() => {
    (async () => {
      const csvData = await csv(csvDataUrl, parseData);
      setResult({
        status: 'success',
        data: csvData
      })
    })()
  }, [])

  return result
}

export default () => {
  const pgeData = usePgeData();

  switch (pgeData.status) {
    case 'incomplete':
      return <div>not ready</div>
    case 'success':
      return <Graph csvData={pgeData.data} />
  }
}
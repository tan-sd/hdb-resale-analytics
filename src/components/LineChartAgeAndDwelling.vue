<template>
    <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
      <h3 class="text-sm text-center tracking-wide font-semibold mb-4">
        Age Composition by Flat Type (100% Stacked Grouped Bar)
      </h3>
      <div id="bar-chart" ref="chartWrapper" class="w-full relative">
        <svg ref="svg" class="w-full h-full"></svg>
      </div>
    </div>
  </template>
  
  <script setup>
  import * as d3 from "d3";
  import { onMounted, ref, nextTick, watch } from "vue";
  import { useDataStore } from "@/stores/dataStore";
  import { toRaw } from "vue";
  
  const svg = ref(null);
  const chartWrapper = ref(null);
  const width = ref(800);
  const height = ref(500);
  const margin = { top: 40, right: 100, bottom: 80, left: 60 };
  
  const dataStore = useDataStore();
  const flatTypes = [
    { label: "1- & 2-Room Flats", source: () => dataStore.flatAgeDist_1and2 },
    { label: "3- & 4-Room Flats", source: () => dataStore.flatAgeDist_3and4 },
    { label: "5-Room & Executive Flats", source: () => dataStore.flatAgeDist_5exec }
  ];
  
  const ageBinMap = {
    "0-4 Years": "0–24", "5-9 Years": "0–24", "10-14 Years": "0–24",
    "15-19 Years": "0–24", "20-24 Years": "0–24",
    "25-29 Years": "25–59", "30-34 Years": "25–59", "35-39 Years": "25–59",
    "40-44 Years": "25–59", "45-49 Years": "25–59", "50-54 Years": "25–59",
    "55-59 Years": "25–59",
    "60-64 Years": "60+", "65-69 Years": "60+", "70-74 Years": "60+",
    "75-79 Years": "60+", "80-84 Years": "60+", "85-89 Years": "60+", "90 Years & Over": "60+"
  };
  
  function processData() {
    const result = [];
  
    flatTypes.forEach(({ label, source }) => {
      const raw = source();
      const grouped = d3.group(raw, d => d.Year);
  
      for (const [year, records] of grouped) {
        const bins = { "0–24": 0, "25–59": 0, "60+": 0 };
        records.forEach(d => {
          const bin = ageBinMap[d["Age Group"]];
          if (bin && d["Population"] != null) {
            bins[bin] += +d["Population"];
          }
        });
  
        const total = bins["0–24"] + bins["25–59"] + bins["60+"];
        result.push({
          Year: +year,
          FlatType: label,
          "0–24": (bins["0–24"] / total) * 100,
          "25–59": (bins["25–59"] / total) * 100,
          "60+": (bins["60+"] / total) * 100
        });
      }
    });
  
    return result;
  }
  
  function drawChart(data) {
    const svgEl = d3.select(svg.value);
    svgEl.selectAll("*").remove();
  
    const totalWidth = width.value + margin.left + margin.right;
    const totalHeight = height.value + margin.top + margin.bottom;
  
    const g = svgEl
      .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const years = Array.from(new Set(data.map(d => d.Year))).sort();
    const flatTypeLabels = flatTypes.map(d => d.label);
    const ageBins = ["0–24", "25–59", "60+"];
  
    const x0 = d3.scaleBand()
      .domain(years)
      .range([0, width.value])
      .padding(0.2);
  
    const x1 = d3.scaleBand()
      .domain(flatTypeLabels)
      .range([0, x0.bandwidth()])
      .padding(0.05);
  
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height.value, 0]);
  
    const color = d3.scaleOrdinal()
      .domain(ageBins)
      .range(["#f97316", "#3b82f6", "#eab308"]);
  
    g.append("g")
      .attr("transform", `translate(0,${height.value})`)
      .call(d3.axisBottom(x0).tickFormat(d3.format("d")))
      .selectAll("text")
      .style("font-size", "10px")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");
  
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .style("font-size", "10px");
  
    const nested = d3.group(data, d => d.Year);
  
    for (const [year, entries] of nested) {
      const group = g.append("g").attr("transform", `translate(${x0(year)},0)`);
  
      entries.forEach(entry => {
        let yStart = height.value;
        const subGroup = group.append("g").attr("transform", `translate(${x1(entry.FlatType)},0)`);
  
        ageBins.forEach(bin => {
          const heightVal = height.value - y(entry[bin]);
          yStart -= heightVal;
  
          subGroup.append("rect")
            .attr("x", 0)
            .attr("y", yStart)
            .attr("width", x1.bandwidth())
            .attr("height", heightVal)
            .attr("fill", color(bin));
  
          if (heightVal > 12) {
            subGroup.append("text")
              .attr("x", x1.bandwidth() / 2)
              .attr("y", yStart + heightVal / 2 + 4)
              .attr("text-anchor", "middle")
              .style("font-size", "8px")
              .style("fill", "white")
              .text(`${entry[bin].toFixed(0)}%`);
          }
        });
      });
    }
  
    const legend = g.append("g").attr("transform", `translate(${width.value + 30}, 20)`);
    ageBins.forEach((bin, i) => {
      const row = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
      row.append("rect")
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color(bin));
      row.append("text")
        .attr("x", 18)
        .attr("y", 10)
        .text(bin)
        .style("font-size", "10px")
        .attr("fill", "#4b5563");
    });
  
    svgEl.append("text")
      .attr("text-anchor", "middle")
      .attr("x", margin.left + width.value / 2)
      .attr("y", totalHeight - 10)
      .style("fill", "#4b5563")
      .style("font-size", "12px")
      .text("Year");
  
    svgEl.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -margin.top - height.value / 2)
      .attr("y", 14)
      .style("fill", "#4b5563")
      .style("font-size", "12px")
      .text("Percentage by Age Bin");
  }
  
  const chartData = ref([]);

  onMounted(async () => {
  await dataStore.ensureDataLoaded();
  await nextTick(); // ensure refs like chartWrapper are populated

  console.log("1and2 length:", dataStore.flatAgeDist_1and2.length);
  console.log("3and4 length:", dataStore.flatAgeDist_3and4.length);
  console.log("5exec length:", dataStore.flatAgeDist_5exec.length);
  console.log("chartWrapper ref:", chartWrapper.value);

  if (
    dataStore.flatAgeDist_1and2.length > 0 &&
    dataStore.flatAgeDist_3and4.length > 0 &&
    dataStore.flatAgeDist_5exec.length > 0 &&
    chartWrapper.value
  ) {
    chartData.value = processData();
    console.log("Processed chartData:", chartData.value.slice(0, 5)); // sample first 5

    width.value = chartWrapper.value.clientWidth - margin.left - margin.right;
    drawChart(toRaw(chartData.value));
  } else {
    console.warn("Data or wrapper not ready, skipping chart draw");
  }

  window.addEventListener("resize", () => {
    if (chartData.value.length > 0 && chartWrapper.value) {
      width.value = chartWrapper.value.clientWidth - margin.left - margin.right;
      drawChart(chartData.value);
    }
  });
});



  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    height: auto;
  }
  </style>
  
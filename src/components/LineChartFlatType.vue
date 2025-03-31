<template>
    <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
      <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">
        Median HDB Resale Price by Flat Type per Year
      </h3>
      <div id="line-chart" ref="chartWrapper" class="w-full relative">
        <svg ref="svg" class="w-full h-full"></svg>
      </div>
    </div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import { onMounted, ref, watch } from "vue";
  import { useDataStore } from "@/stores/dataStore";
  
  const latestData = ref([]);
  const hasDrawn = ref(false);
  
  export default {
    name: "LineChartFlatType",
    setup() {
      const svg = ref(null);
      const chartWrapper = ref(null);
      const width = ref(800);
      const height = ref(600);
      const margin = { top: 20, right: 30, bottom: 40, left: 80 };
      const dataStore = useDataStore();
  
      const resizeAndRedraw = () => {
        setDimensions();
        if (latestData.value.length) {
          drawLineChart(latestData.value);
        }
      };
  
      const drawLineChart = (data) => {
        const svgEl = d3.select(svg.value);
        svgEl.selectAll("*").remove();
  
        const totalWidth = width.value + margin.left + margin.right;
        const totalHeight = height.value + margin.top + margin.bottom;
  
        svgEl.attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
  
        const grouped = d3.groups(data, d => d.Year, d => d.FlatType);
        const lineData = [];
  
        grouped.forEach(([year, categories]) => {
          categories.forEach(([type, records]) => {
            const median = d3.median(records, d => d.MedianPrice);
            if (median) {
              lineData.push({
                Year: +year,
                FlatType: type,
                MedianPrice: median
              });
            }
          });
        });
  
        const flatTypes = Array.from(new Set(lineData.map(d => d.FlatType))).sort();
        const years = Array.from(new Set(lineData.map(d => d.Year))).sort();
  
        const x = d3.scaleLinear()
          .domain(d3.extent(years))
          .range([margin.left, width.value + margin.left]);
  
        const y = d3.scaleLinear()
          .domain([0, d3.max(lineData, d => d.MedianPrice)])
          .range([height.value + margin.top, margin.top])
          .nice();
  
        const color = d3.scaleOrdinal()
          .domain(flatTypes)
          .range(d3.schemeTableau10);
  
        const line = d3.line()
          .x(d => x(d.Year))
          .y(d => y(d.MedianPrice));
  
        const groupedLines = d3.group(lineData, d => d.FlatType);
  
        const g = svgEl.append("g");
  
        g.append("g")
          .attr("transform", `translate(0,${height.value + margin.top})`)
          .call(d3.axisBottom(x).tickFormat(d3.format("d")));
  
        g.append("g")
          .attr("transform", `translate(${margin.left},0)`)
          .call(d3.axisLeft(y));
  
        groupedLines.forEach((values, key) => {
          g.append("path")
            .datum(values)
            .attr("class", "line-group")
            .attr("data-key", key)
            .attr("fill", "none")
            .attr("stroke", color(key))
            .attr("stroke-width", 2)
            .attr("d", line)
            .style("opacity", 1);
        });
  
        svgEl.append("text")
          .attr("text-anchor", "middle")
          .attr("x", margin.left + width.value / 2)
          .attr("y", totalHeight - 5)
          .style("fill", "#4b5563")
          .style("font-size", "12px")
          .style("font-weight", "500")
          .text("Year");
  
        svgEl.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("x", -margin.top - height.value / 2)
          .attr("y", 15)
          .style("fill", "#4b5563")
          .style("font-size", "12px")
          .style("font-weight", "500")
          .text("Resale Price");
        
        const legendWidth = 140;
        const legendHeight = flatTypes.length * 20 + 10;

        const legend = svgEl.append("g")
          .attr("class", "legend")
          .attr("transform", `translate(${margin.left + 40}, ${margin.top})`);
        
        legend.append("rect")
          .attr("width", legendWidth)
          .attr("height", legendHeight)
          .attr("fill", "white")
          .attr("stroke", "#d1d5db")
          .attr("rx", 6)
          .attr("ry", 6)
          .attr("opacity", 0.95);

        flatTypes.forEach((type, i) => {
          const legendRow = legend.append("g")
            .attr("transform", `translate(10, ${i * 20 + 15})`);

          legendRow.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 5)
            .attr("fill", color(type));

          legendRow.append("text")
            .attr("x", 12)
            .attr("y", 2)
            .style("fill", "#4b5563")
            .style("font-size", "10px")
            .style("font-weight", "500")
            .text(type);
        });
      };
  
      const setDimensions = () => {
        if (chartWrapper.value) {
          width.value = chartWrapper.value.clientWidth - margin.left - margin.right;
          height.value = 500;
        }
      };
  
      onMounted(() => {
        setDimensions();
        window.addEventListener("resize", setDimensions);
  
        watch(
          () => dataStore.isDataReady,
          (ready) => {
            if (ready && !hasDrawn.value) {
              const raw = dataStore.yearFlatTypeMedians;
              if (!raw || !raw.length) return;
  
              const formatted = raw
                .filter(d => d.FlatType && d.Year && d.median)
                .map(d => ({
                  Year: +d.Year,
                  FlatType: d.FlatType,
                  MedianPrice: +d.median,
                }));
  
              latestData.value = formatted;
  
              requestAnimationFrame(() => {
                if (chartWrapper.value?.offsetWidth > 0) {
                  setDimensions();
                  drawLineChart(formatted);
                  hasDrawn.value = true;
                }
              });
            }
          },
          { immediate: true }
        );
      });
  
      return {
        svg,
        chartWrapper,
        resizeAndRedraw,
      };
    },
  };
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    height: auto;
  }
  </style>
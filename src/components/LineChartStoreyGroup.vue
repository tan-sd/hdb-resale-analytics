<template>
    <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
      <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">Median HDB Resale Price by Storey Group per Year</h3>
      <div id="line-chart" ref="chartWrapper" class="w-full relative">
        <svg ref="svg" class="w-full h-full"></svg>
      </div>
    </div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import { onMounted, ref, watch } from "vue";
  import { useDataStore } from "../stores/dataStore";

  const latestData = ref([]);
  const hasDrawn = ref(false);
  
  export default {
    name: "MedianPriceByFloorGroup",
    setup() {
        const svg = ref(null);
        const chartWrapper = ref(null);
        const width = ref(800);
        const height = ref(600);
        const margin = { top: 20, right: 30, bottom: 40, left: 80 };
        const dataStore = useDataStore();
        
        const highlightLines = (activeKeys = []) => {
            const svgEl = d3.select(svg.value);
            
            svgEl.selectAll("path.line-group")
                .style("opacity", function () {
                    const key = this.getAttribute("data-key");
                    return activeKeys.length === 0 || activeKeys.includes(key) ? 1 : 0.2;
                });

            svgEl.selectAll("g.legend-item")
                .style("opacity", function () {
                    const key = this.getAttribute("data-key");
                    return activeKeys.length === 0 || activeKeys.includes(key) ? 1 : 0.3;
                });
        };

        const resizeAndRedraw = () => {
            setDimensions();
            if (latestData.value.length) {
                 drawLineChart(latestData.value);
                }
        };
        
        function getFloorCategory(avgStorey) {
            if (avgStorey >= 1 && avgStorey <= 3) return "Very Low";
            if (avgStorey >= 4 && avgStorey <= 6) return "Low";
            if (avgStorey >= 7 && avgStorey <= 10) return "Mid";
            if (avgStorey >= 11) return "High";
            return null;
        }
        
        const drawLineChart = (data) => {
            const svgEl = d3.select(svg.value);
            svgEl.selectAll("*").remove();
            
            const totalWidth = width.value + margin.left + margin.right;
            const totalHeight = height.value + margin.top + margin.bottom;
            
            svgEl.attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
            
            const grouped = d3.groups(data, d => d.Year, d => d.FloorCategory);
            const lineData = [];
  
            grouped.forEach(([year, categories]) => {
                categories.forEach(([category, records]) => {
                    const median = d3.median(records, d => d.ResalePrice);
                    if (median) {
                        lineData.push({
                            Year: +year,
                            FloorCategory: category,
                            MedianPrice: median
                        });
                    }
                });
            });
  
        const categories = [
            { key: "Very Low", label: "Very Low (1–3 storeys)" },
            { key: "Low", label: "Low (4–6 storeys)" },
            { key: "Mid", label: "Mid (7–10 storeys)" },
            { key: "High", label: "High (≥11 storeys)" }
        ];
        const years = Array.from(new Set(lineData.map(d => d.Year))).sort();
  
        const x = d3.scaleLinear()
          .domain(d3.extent(years))
          .range([margin.left, width.value + margin.left]);
  
        const y = d3.scaleLinear()
          .domain([0, d3.max(lineData, d => d.MedianPrice)])
          .range([height.value + margin.top, margin.top])
          .nice();
  
          const color = d3.scaleOrdinal()
            .domain(categories.map(c => c.key))
            .range(d3.schemeSet2);
  
        const line = d3.line()
          .x(d => x(d.Year))
          .y(d => y(d.MedianPrice));
  
        const groupedLines = d3.group(lineData, d => d.FloorCategory);
  
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

        const legendPadding = 10;
        const legendItemHeight = 20;
        const legendBoxWidth = 160;
        const legendBoxHeight = categories.length * legendItemHeight + legendPadding * 2;

        const legendGroup = svgEl.append("g")
        .attr(
            "transform",
            `translate(${width.value + margin.left - legendBoxWidth - 10}, ${
            height.value + margin.top - 150
            })`
        );

        legendGroup
        .append("rect")
        .attr("width", legendBoxWidth)
        .attr("height", legendBoxHeight)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("fill", "#fff")
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1.2)
        .attr("opacity", 0.95);

        categories.forEach((cat, i) => {
            const yOffset = legendPadding + i * legendItemHeight;

            const itemGroup = legendGroup
                .append("g")
                .attr("class", "legend-item")
                .attr("data-key", cat.key)
                .attr("transform", `translate(0, ${yOffset})`);

            itemGroup
                .append("circle")
                .attr("cx", 12)
                .attr("cy", 6)
                .attr("r", 5)
                .attr("fill", color(cat.key));

            itemGroup
                .append("text")
                .attr("x", 24)
                .attr("y", 10)
                .text(cat.label)
                .attr("font-size", "12px")
                .attr("alignment-baseline", "middle")
                .attr("fill", "#333");
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
            .attr("y", 10)
            .style("fill", "#4b5563")
            .style("font-size", "12px")
            .style("font-weight", "500")
            .text("Resale Price");
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
                const raw = dataStore.chartData;
                const data = raw
                    .filter(d => d["Storey Lower"] && d["Storey Upper"] && d["Resale Price Adj 2024"] && d.Year)
                    .map(d => {
                    const lower = parseInt(d["Storey Lower"]);
                    const upper = parseInt(d["Storey Upper"]);
                    const avg = (lower + upper) / 2;
                    return {
                        Year: +d.Year,
                        AvgStorey: avg,
                        FloorCategory: getFloorCategory(avg),
                        ResalePrice: parseFloat(d["Resale Price Adj 2024"])
                    };
                    })
                    .filter(d => !isNaN(d.AvgStorey) && !isNaN(d.ResalePrice) && d.FloorCategory);

                latestData.value = data;

                requestAnimationFrame(() => {
                    if (chartWrapper.value?.offsetWidth > 0) {
                    setDimensions();
                    drawLineChart(data);
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
        highlightLines
      };
    },
  };
  </script>
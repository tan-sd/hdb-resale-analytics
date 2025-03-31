<template>
    <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
      <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">
        Price per Sqm by Planning Area
      </h3>
      <div id="box-plot" ref="chartWrapper" class="w-full relative">
        <svg ref="svg" class="w-full h-full"></svg>
      </div>
    </div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import { ref, onMounted, watch, nextTick } from "vue";
  import { useDataStore } from "@/stores/dataStore";
  import gsap from "gsap";
  
  export default {
    name: "BoxPlotPricePerSqm",
    setup() {
      const svg = ref(null);
      const chartWrapper = ref(null);
      const width = ref(800);
      const height = ref(500);
      const margin = { top: 20, right: 30, bottom: 90, left: 70 };
      const dataStore = useDataStore();
      const originalOrder = ref([]);
      const processedData = ref([]);
  
      const resizeAndRedraw = () => {
            setDimensions();
            drawChart(dataStore.pricePerSqmByPlanningArea || []);
        };
  
    const setDimensions = () => {
        if (!chartWrapper.value) return;

        const widthAvailable = chartWrapper.value.clientWidth;
        if (widthAvailable === 0) return;

        width.value = widthAvailable - margin.left - margin.right;
        height.value = 500;
    };

    let x = null;
    let g = null;
  
    const drawChart = (data) => {
        processedData.value = data.map((d) => {
            const values = [...d.values].sort(d3.ascending);
            const q1 = d3.quantile(values, 0.25);
            const median = d3.quantile(values, 0.5);
            const q3 = d3.quantile(values, 0.75);
            const iqr = q3 - q1;
            const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
            const max = Math.min(d3.max(values), q3 + 1.5 * iqr);
            return { ...d, q1, median, q3, iqr, min, max };
        });

        originalOrder.value = processedData.value.map(d => d.area);

        const svgEl = d3.select(svg.value);
        svgEl.selectAll("*").remove();
  
        const totalWidth = width.value + margin.left + margin.right;
        const totalHeight = height.value + margin.top + margin.bottom;
  
        svgEl.attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`);
        g = svgEl.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
        x = d3.scaleBand()
          .domain(processedData.value.map(d => d.area))
          .range([0, width.value])
          .paddingInner(0.3)
          .paddingOuter(0.2);
  
        const allValues = processedData.value.flatMap(d => d.values);
        const y = d3.scaleLinear()
          .domain([0, d3.quantile(allValues, 0.99)])
          .range([height.value, 0])
          .nice();
  
        g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height.value})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .style("fill", "#4b5563");
  
        g.append("g")
          .call(d3.axisLeft(y))
          .selectAll("text")
          .style("font-size", "10px")
          .style("fill", "#4b5563");
  
        svgEl.append("text")
            .attr("text-anchor", "middle")
            .attr("x", margin.left + width.value / 2)
            .attr("y", totalHeight - 5)
            .style("fill", "#4b5563")
            .style("font-size", "12px")
            .style("font-weight", "500")
            .text("Planning Area");
  
        svgEl.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -margin.top - height.value / 2)
            .attr("y", 15)
            .style("fill", "#4b5563")
            .style("font-size", "12px")
            .style("font-weight", "500")
            .text("Price per Sqm");

        const boxGroups = g.selectAll(".box-group")
            .data(processedData.value, d => d.area)
            .enter()
            .append("g")
            .attr("class", "box-group")
            .attr("transform", d => `translate(${x(d.area)}, 0)`);

        boxGroups.append("line")
            .attr("x1", x.bandwidth() / 2)
            .attr("x2", x.bandwidth() / 2)
            .attr("y1", d => y(d.min))
            .attr("y2", d => y(d.max))
            .attr("stroke", "black");

        boxGroups.append("rect")
            .attr("y", d => y(d.q3))
            .attr("height", d => y(d.q1) - y(d.q3))
            .attr("width", x.bandwidth())
            .attr("stroke", "black")
            .attr("fill", "#69b3a2");

        boxGroups.append("line")
            .attr("x1", 0)
            .attr("x2", x.bandwidth())
            .attr("y1", d => y(d.median))
            .attr("y2", d => y(d.median))
            .attr("stroke", "black");
      };

      const sortByMedianDescending = () => {
        const sorted = [...processedData.value].sort((a, b) => b.median - a.median);

        x.domain(sorted.map(d => d.area));

        g.selectAll(".box-group")
            .data(sorted, d => d.area)
            .each(function(d) {
            const newX = x(d.area);
            gsap.to(this, {
                duration: 0.8,
                ease: "power3.inOut",
                attr: { transform: `translate(${newX}, 0)` }
            });
            });

        g.select(".x-axis")
            .transition()
            .duration(800)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "10px")
            .style("fill", "#4b5563");
        };

        const sortToOriginalOrder = () => {
            if (!originalOrder.value || !x || !g) return;

            x.domain(originalOrder.value);

            g.selectAll(".box-group")
                .data(processedData.value, d => d.area)
                .each(function (d) {
                const newX = x(d.area);
                gsap.to(this, {
                    duration: 0.8,
                    ease: "power3.inOut",
                    attr: { transform: `translate(${newX}, 0)` },
                });
                });

            g.select(".x-axis")
                .transition()
                .duration(800)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end")
                .style("font-size", "10px")
                .style("fill", "#4b5563");
            };
    
        onMounted(async () => {
            await nextTick();
            requestAnimationFrame(() => {
                setDimensions();
                drawChart(dataStore.pricePerSqmByPlanningArea || []);
            });

        window.addEventListener("resize", () => {
            setDimensions();
            drawChart(dataStore.pricePerSqmByPlanningArea || []);
        });

        watch(
            () => dataStore.isDataReady,
            (ready) => {
            if (ready) {
                requestAnimationFrame(() => {
                setDimensions();
                drawChart(dataStore.pricePerSqmByPlanningArea || []);
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
        sortByMedianDescending,
        sortToOriginalOrder,
      };
    },
  };
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    height: auto;
  }

  #box-plot {
    width: 100%;
    height: 100%;
    position: relative;
  }
  </style>
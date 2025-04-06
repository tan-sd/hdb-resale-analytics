<template>
  <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
    <div id="box-plot" ref="chartWrapper" class="w-full relative">
      <svg ref="svg" class="w-full h-full"></svg>
    </div>
  </div>
</template>

<script>
import { useDataStore } from "@/stores/dataStore";
import * as d3 from "d3";
import { ref, onMounted, watch, nextTick } from "vue";

export default {
  name: "BoxPlotElectoralBoundaries",
  setup() {
    const svg = ref(null);
    const chartWrapper = ref(null);
    const width = ref(800);
    const height = ref(500);
    const margin = { top: 50, right: 30, bottom: 90, left: 85 };

    // Access the dataStore
    const dataStore = useDataStore();
    const borderFlats = dataStore.borderFlats;

    const resizeAndRedraw = () => {
      setDimensions();
      drawChart(borderFlats || []);
    };

    const setDimensions = () => {
      if (!chartWrapper.value) return;
      const widthAvailable = chartWrapper.value.clientWidth;
      if (widthAvailable === 0) return;
      width.value = widthAvailable - margin.left - margin.right;
      height.value = 500;
    };

    const drawChart = (data) => {
      if (!data || data.length === 0) {
        return;
      }

      const processedData = data.map((d) => {
        const values = [...d.values].sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
        const max = Math.min(d3.max(values), q3 + 1.5 * iqr);
        return { ...d, q1, median, q3, iqr, min, max };
      });

      const svgEl = d3.select(svg.value);
      svgEl.selectAll("*").remove();

      const totalWidth = width.value + margin.left + margin.right;
      const totalHeight = height.value + margin.top + margin.bottom;
      const g = svgEl
        .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const zoneOrder = ["PAP", "WP", "SDA"];
      processedData.sort((a, b) => {
        if (a.period !== b.period) return a.period.localeCompare(b.period);
        return zoneOrder.indexOf(a.zone) - zoneOrder.indexOf(b.zone);
      });

      const periods = Array.from(new Set(processedData.map((d) => d.period)));
      const zones = ["PAP", "WP", "SDA"];

      const x0 = d3.scaleBand()
        .domain(periods)
        .range([0, width.value])
        .paddingInner(0.1)
        .paddingOuter(0.2);

      const x1 = d3.scaleBand()
        .domain(zones)
        .range([0, x0.bandwidth()])
        .padding(0.05);

      const allValues = processedData.flatMap((d) => d.values);
      const y = d3.scaleLinear()
        .domain([0, d3.quantile(allValues, 0.99)])
        .range([height.value, 0])
        .nice();

      g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height.value})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .attr("y", 15);

      g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "12px");

      svgEl.append("text")
        .attr("text-anchor", "middle")
        .attr("x", margin.left + width.value / 2)
        .attr("y", margin.top - 30)
        .style("fill", "black")
        .style("font-size", "14px")
        .style("font-weight", "500")
        .text("Resale Prices (2024 Adj) Within 500m of WP/SDA–PAP Boundaries");

      svgEl.append("text")
        .attr("text-anchor", "middle")
        .attr("x", margin.left + width.value / 2)
        .attr("y", totalHeight - 35)
        .style("fill", "#4b5563")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .text("Electoral Period");

      svgEl.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -margin.top - height.value / 2)
        .attr("y", 10)
        .style("fill", "#4b5563")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .text("Resale Price (2024 Adj)");

      const boxGroups = g.selectAll(".box-group")
        .data(processedData)
        .enter()
        .append("g")
        .attr("class", "box-group")
        .attr("transform", (d) => `translate(${x0(d.period) + x1(d.zone)}, 0)`);

      boxGroups.append("line")
        .attr("x1", x1.bandwidth() / 2)
        .attr("x2", x1.bandwidth() / 2)
        .attr("y1", (d) => y(d.min))
        .attr("y2", (d) => y(d.max))
        .attr("stroke", "black");

      boxGroups.append("rect")
        .attr("y", (d) => y(d.q3))
        .attr("height", (d) => y(d.q1) - y(d.q3))
        .attr("width", x1.bandwidth())
        .attr("stroke", "black")
        .attr("fill", (d) =>
          d.zone === "PAP" ? "#60a5fa" : d.zone === "WP" ? "#f87171" : "#facc15"
        );

      boxGroups.append("line")
        .attr("x1", 0)
        .attr("x2", x1.bandwidth())
        .attr("y1", (d) => y(d.median))
        .attr("y2", (d) => y(d.median))
        .attr("stroke", "black");
    };

    onMounted(async () => {
      await nextTick();
      requestAnimationFrame(() => {
        setDimensions();
        drawChart(borderFlats || []);
      });

      window.addEventListener("resize", () => {
        setDimensions();
        drawChart(borderFlats || []);
      });

      watch(
        () => dataStore.isDataReady,
        (ready) => {
          if (ready) {
            requestAnimationFrame(() => {
              setDimensions();
              drawChart(borderFlats || []);
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
  height: 100%;
  padding: 30px;
  box-sizing: border-box;
}

#box-plot {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>

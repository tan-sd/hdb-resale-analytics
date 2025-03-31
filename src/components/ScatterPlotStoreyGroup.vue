<template>
    <div class="chart-container relative flex flex-col items-center justify-center">
      <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">HDB Price per Sqm by Storey Group</h3>
      <div id="line-chart" ref="chartWrapper" class="w-full h-full relative">
        <canvas ref="canvas"></canvas>
        <svg ref="svg" class="absolute top-0 left-0 pointer-events-none"></svg>
      </div>
      <div
        id="tooltip-median"
        style="
          position: absolute;
          padding: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border-radius: 5px;
          display: none;
        "
      ></div>
    </div>
</template>

<script>
import * as d3 from "d3";
import { onMounted, ref, registerRuntimeCompiler, watch } from "vue";
import { useDataStore } from "../stores/dataStore";

export default {
  name: "ScatterPlotStories",
  props: {
    preloadMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const canvas = ref(null);
    const svg = ref(null);
    const chartWrapper = ref(null);
    const tooltip = ref(null);
    const width = ref(800);
    const height = ref(600);
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };

    const dataStore = useDataStore();

    function getStoreyBin(avgStorey) {
    const bins = [
      [0, 5],
      [5, 10],
      [10, 15],
      [15, 20],
      [20, 25],
      [25, 30],
      [30, 35],
      [35, 40],
      [40, 45],
      [45, 51]
    ];
    for (const [start, end] of bins) {
      if (avgStorey >= start && avgStorey < end) return `${start}-${end}`;
    }
    return null;
  }

    const drawScatter = (data) => {
      if (props.preloadMode) return;
      if (!canvas.value || !svg.value) return; 

      const ctx = canvas.value.getContext("2d");
      const svgEl = d3.select(svg.value);
      svgEl.selectAll("*").remove();

      const dpr = window.devicePixelRatio || 1;
      const totalWidth = width.value + margin.left + margin.right;
      const totalHeight = height.value + margin.top + margin.bottom;

      canvas.value.width = totalWidth * dpr;
      canvas.value.height = totalHeight * dpr;
      canvas.value.style.width = "100%";
      canvas.value.style.height = "auto";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, totalWidth, totalHeight);

      const categorizedData = data.map(d => ({
        ...d,
        StoreyBin: getStoreyBin(d.AvgStorey),
      })).filter(d => d.StoreyBin);

      const bins = [
        "0-5", "5-10", "10-15", "15-20", "20-25",
        "25-30", "30-35", "35-40", "40-45", "45-51"
      ];

      const x = d3.scaleBand()
        .domain(bins)
        .range([margin.left, width.value + margin.left])
        .padding(0.2);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PricePerSqm)])
        .range([height.value + margin.top, margin.top])
        .nice();

      categorizedData.forEach(d => {
        const jitterAmount = x.bandwidth() * 0.4;
        const cx = x(d.StoreyBin) + x.bandwidth() / 2 + (Math.random() - 0.5) * jitterAmount;
        const cy = y(d.PricePerSqm);

        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(30, 144, 255, 0.15)";
        ctx.fill();
      });

      svgEl
        .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("width", "100%")
        .attr("height", "auto");

      svgEl.append("g")
        .attr("transform", `translate(0,${height.value + margin.top})`)
        .call(d3.axisBottom(x).tickSizeOuter(0))
        .attr("font-size", "10px");

      svgEl.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

      svgEl.append("text")
        .attr("x", margin.left + width.value / 2)
        .attr("y", totalHeight - 5)
        .attr("text-anchor", "middle")
        .style("fill", "#4b5563")
        .style("font-size", "12px")
        .style("font-weight", 500)
        .text("Storey Range");

      svgEl.append("text")
        .attr("transform", `rotate(-90)`)
        .attr("x", -margin.top - height.value / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("fill", "#4b5563")
        .style("font-size", "12px")
        .style("font-weight", 500)
        .text("Price per Sqm");

      const binGroups = d3.group(categorizedData, d => d.StoreyBin);

      for (const [bin, values] of binGroups.entries()) {
        const resalePrices = values.map(d => d.PricePerSqm).sort(d3.ascending);
        const median = d3.median(resalePrices);

        if (median !== undefined && x(bin)) {
          const xStart = x(bin);
          const xEnd = xStart + x.bandwidth();
          const yMedian = y(median);

          svgEl.append("line")
            .attr("x1", xStart)
            .attr("x2", xEnd)
            .attr("y1", yMedian)
            .attr("y2", yMedian)
            .attr("stroke", "crimson")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,2");
        }
      }
    };

    const setDimensions = () => {
      if (chartWrapper.value) {
        width.value = chartWrapper.value.clientWidth - margin.left - margin.right;
        height.value = chartWrapper.value.clientWidth * 0.6;
      }
    };

    onMounted(() => {
      setDimensions();
      window.addEventListener("resize", setDimensions);

      watch(
      [() => dataStore.isDataReady, () => dataStore.chartData],
      ([ready, raw]) => {
        if (!ready || !raw) return;

        const data = raw
          .filter(d => d["Storey Lower"] && d["Storey Upper"] && d["Resale Price Adj 2024"] && d["Floor Area Sqm"])
          .map(d => ({
            AvgStorey: (parseInt(d["Storey Lower"]) + parseInt(d["Storey Upper"])) / 2,
            PricePerSqm: parseFloat(d["Resale Price Adj 2024"]) / parseFloat(d["Floor Area Sqm"]),
          }))
          .filter(d => !isNaN(d.AvgStorey) && !isNaN(d.PricePerSqm));

        drawScatter(data);
      },
      { immediate: true }
    );
    });

    return {
      canvas,
      svg,
      chartWrapper,
    };
  },
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 800px;
  height: auto;
}

#line-chart {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
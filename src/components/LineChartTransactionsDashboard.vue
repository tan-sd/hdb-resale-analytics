<template>
  <div ref="chartContainer" class="w-full h-full relative">
    <svg ref="svg" class="w-full h-full"></svg>

    <div
      v-if="!hasTransactionsData"
      class="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm"
    >
      No data available for this area and year.
    </div>

    <div
      ref="tooltip"
      class="absolute z-50 pointer-events-none bg-white text-xs px-2 py-1 border border-gray-300 rounded shadow"
      style="visibility: hidden"
    ></div>
  </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, watch, onMounted, nextTick, computed } from "vue";
import { useDataStore } from "../stores/dataStore";

const dataStore = useDataStore();
const svg = ref(null);
const chartContainer = ref(null);
const tooltip = ref(null);
const transactionsData = ref([]);
const hasTransactionsData = computed(() => transactionsData.value.length > 0);

const props = defineProps({
  selectedFlatType: {
    type: String,
    default: "All",
  },
  areaName: {
    type: String,
    default: "All Singapore",
  },
  year: {
    type: String,
    default: "2023",
  },
});

const margin = { top: 20, right: 30, bottom: 50, left: 80 };
margin.bottom = 70;

let width = 0;
let height = 0;

const positionTooltip = (event, tooltipElement) => {
  if (!tooltipElement || !chartContainer.value) return;
  const chartRect = chartContainer.value.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();
  const relativeX = event.clientX - chartRect.left;
  const relativeY = event.clientY - chartRect.top;
  const top = relativeY - tooltipRect.height < 0 ? relativeY + 20 : relativeY - tooltipRect.height;
  const left =
    relativeX + tooltipRect.width > chartRect.width
      ? Math.max(0, relativeX - tooltipRect.width - 5)
      : relativeX + 5;

  tooltipElement.style.top = `${top}px`;
  tooltipElement.style.left = `${left}px`;
};

const drawChart = () => {
  const svgSelection = d3.select(svg.value);
  svgSelection.selectAll("*").remove();

  if (!svg.value || !dataStore.chartData.length) {
    transactionsData.value = [];
    return;
  }

  const filteredData = dataStore.chartData.filter((d) => {
    const flatTypeMatch = props.selectedFlatType === "All" || d["Flat Type"] === props.selectedFlatType;
    const areaMatch = props.areaName === "All Singapore" || d["Planning Area"] === props.areaName;
    return flatTypeMatch && areaMatch;
  });

  const grouped = d3.groups(filteredData, (d) => d.Year);
  const transactionsPerYear = grouped
    .map(([year, values]) => ({
      year: +year,
      count: values.length,
    }))
    .filter((d) => d.year !== 2023)
    .sort((a, b) => a.year - b.year);

  transactionsData.value = transactionsPerYear;

  if (!transactionsPerYear.length) return;

  const container = chartContainer.value;
  width = container.clientWidth - margin.left - margin.right;
  height = container.clientHeight - margin.top - margin.bottom;

  const x = d3
    .scaleLinear()
    .domain([1990, 2023])
    .range([margin.left, margin.left + width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(transactionsPerYear, (d) => d.count)])
    .nice()
    .range([margin.top + height, margin.top]);

  const svgEl = d3.select(svg.value);

  // X Axis
  svgEl
    .append("g")
    .attr("transform", `translate(0,${margin.top + height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")))
    .append("text")
    .attr("x", margin.left + width / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Year");

  // Y Axis
  svgEl
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -margin.top - height / 2)
    .attr("y", -70)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Transactions");

  // Line
  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.count));

  svgEl
    .append("path")
    .datum(transactionsPerYear)
    .attr("fill", "none")
    .attr("stroke", "#f97316")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Dots + Tooltip
  svgEl
    .selectAll("circle")
    .data(transactionsPerYear)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.year))
    .attr("cy", (d) => y(d.count))
    .attr("r", 4)
    .attr("fill", (d) => d.year === +props.year ? "red" : "#f97316")
    .on("mouseover", (event, d) => {
      d3.select(tooltip.value)
        .style("visibility", "visible")
        .html(
          `<div class="font-semibold">Year ${d.year}</div>
           <div>${d.count} transactions</div>`
        );
    })
    .on("mousemove", (event) => {
      positionTooltip(event, tooltip.value);
    })
    .on("mouseout", () => {
      d3.select(tooltip.value).style("visibility", "hidden");
    });
};

onMounted(async () => {
  await nextTick();
  drawChart();
});

watch(
  () => [props.selectedFlatType, props.areaName, props.year],
  () => {
    drawChart();
  }
);
</script>

<template>
  <div ref="chartContainer" class="w-full h-full relative">
    <svg ref="chart" class="w-full h-full"></svg>
    <div
      v-if="!hasData || !hasStoreyRangeData"
      class="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm"
    >
      No data available for this area and year.
    </div>
    <div
      ref="tooltip"
      class="absolute z-50 text-xs bg-white border border-gray-300 rounded px-2 py-1 shadow-md pointer-events-none"
      style="opacity: 0;"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as d3 from 'd3';

const chart = ref(null);
const chartContainer = ref(null);
const tooltip = ref(null);
const storeyRangeData = ref([]);
const hasStoreyRangeData = computed(() => storeyRangeData.value.length > 0);

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  areaName: {
    type: String,
    default: 'All Singapore',
  },
  year: {
    type: String,
    default: "2023",
  },
  selectedFlatType: {
    type: String,
    default: 'All',
  },
});

const hasData = computed(() => props.data && props.data.length > 0);

const formatWithCommas = (val) =>
  val.toLocaleString('en-US', { maximumFractionDigits: 0 });

const storeyBin = (lower) => {
  const floor = +lower;
  if (floor < 6) return '01–05';
  if (floor < 11) return '06–10';
  if (floor < 16) return '11–15';
  if (floor < 21) return '16–20';
  if (floor < 26) return '21–25';
  if (floor < 31) return '26–30';
  if (floor < 36) return '31–35';
  if (floor < 41) return '36–40';
  if (floor < 46) return '41–45';
  return '46–51';
};

const storeyOrder = [
  '01–05',
  '06–10',
  '11–15',
  '16–20',
  '21–25',
  '26–30',
  '31–35',
  '36–40',
  '41–45',
  '46–51',
];

const positionTooltip = (event, tooltipElement) => {
  if (!tooltipElement || !chartContainer.value) return;

  const chartRect = chartContainer.value.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();

  const relativeX = event.clientX - chartRect.left;
  const relativeY = event.clientY - chartRect.top;

  let top, left;

  const preferredTop = relativeY - tooltipRect.height;
  const preferredLeft = relativeX + 5;

  if (preferredTop < 0) {
    top = relativeY + 20;
  } else {
    top = preferredTop;
  }

  if (preferredLeft + tooltipRect.width > chartRect.width) {
    left = relativeX - tooltipRect.width - 5;

    if (left < 0) {
      left = Math.max(0, relativeX - tooltipRect.width / 2);
    }
  } else {
    left = preferredLeft;
  }

  tooltipElement.style.top = `${top}px`;
  tooltipElement.style.left = `${left}px`;
};

const drawChart = () => {
  const svgSelection = d3.select(chart.value);
  svgSelection.selectAll("*").remove();

  if (!chart.value || !hasData.value) {
    storeyRangeData.value = [];
    return;
  }

  const filtered = props.data
  .filter((d) => {
    const hasPlanningArea = d["Planning Area"] && d["Planning Area"].trim() !== "";
    const matchesYear = String(d["Year"]) === String(props.year);
    const matchesFlatType = props.selectedFlatType === "All" || d["Flat Type"] === props.selectedFlatType;
    return hasPlanningArea && matchesYear && matchesFlatType;
  });

const grouped = d3.group(filtered, (d) => storeyBin(d['Storey Lower']));
const binned = storeyOrder
  .map((range) => ({
    range,
    count: grouped.get(range)?.length || 0,
  }))
  .filter((d) => d.count > 0);

storeyRangeData.value = binned;

if (binned.length === 0) {
    return;
  }

  const width = chart.value.clientWidth;
  const height = chart.value.clientHeight;
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };

  margin.bottom = 70;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select(chart.value)
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const y = d3
    .scaleBand()
    .domain(binned.map((d) => d.range))
    .range([0, innerHeight])
    .padding(0.2);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(binned, (d) => d.count)])
    .nice()
    .range([0, innerWidth]);

  svg.append('g').call(d3.axisLeft(y)).selectAll('text').style('font-size', '12px');

  svg
    .append('g')
    .attr('transform', `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).ticks(5))
    .selectAll('text')
    .style('font-size', '12px');

  svg.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Count");

  svg
    .selectAll('rect')
    .data(binned)
    .enter()
    .append('rect')
    .attr('y', (d) => y(d.range))
    .attr('x', 0)
    .attr('height', y.bandwidth())
    .attr('width', (d) => x(d.count))
    .attr('fill', '#3b82f6')
    .style('opacity', 0.8)
    .on('mouseover', function (event, d) {
      d3.select(this).style('opacity', 1);
      const percent = ((d.count / filtered.length) * 100).toFixed(1);
      tooltip.value.innerHTML = `Storey ${d.range}: <strong>${formatWithCommas(
        d.count
      )}</strong> units`;
      tooltip.value.style.opacity = 1;
      positionTooltip(event, tooltip.value);
    })
    .on('mousemove', (event) => positionTooltip(event, tooltip.value))
    .on('mouseout', function () {
      d3.select(this).style('opacity', 0.8);
      tooltip.value.style.opacity = 0;
    });
};

onMounted(() => {
  if (hasData.value) drawChart();
});

watch(
  () => [props.data, props.areaName, props.year, props.selectedFlatType],
  () => {
    drawChart();
  },
  { deep: true }
);

console.log(props.selectedFlatType)
watch(
  () => props.selectedFlatType,
  (newVal) => {
    console.log("StoreyRangeBarChart - selectedFlatType changed to:", newVal);
  }
);

watch(
  () => storeyRangeData.value,
  (newVal) => {
    for (const item of newVal) {
      console.log("StoreyRangeBarChart - storeyRangeData changed:", item);
    }
  }
)

onUnmounted(() => {
  tooltip.value?.remove();
});
</script>

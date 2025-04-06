<template>
    <div ref="chartContainer" class="w-full h-full relative">
      <svg ref="chart" class="w-full h-full"></svg>
      <div ref="tooltip"
           class="absolute z-50 text-xs bg-white border border-gray-300 rounded px-2 py-1 shadow-md pointer-events-none"
           style="opacity: 0;">
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import { useDataStore } from "@/stores/dataStore";
import * as d3 from "d3";

const chartContainer = ref(null);
const chart = ref(null);
const tooltip = ref(null);
const dataStore = useDataStore();
const demographicYears = [2000, 2005, 2010, 2015, 2020];

const emit = defineEmits(['update:fallback-year']);

const props = defineProps({
    data: {
        type: Array,
        required: true,
    },
    areaName: {
        type: String,
        default: "All Singapore",
    },
    year: {
        type: String,
        default: 2023,
    },
});

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

const fallbackYear = computed(() => {
    const inputYear = props.year;
    const valid = demographicYears.filter((y) => y <= inputYear);
    return valid.length > 0 ? Math.max(...valid) : null;
});

watch(fallbackYear, (newValue) => {
    emit('update:fallback-year', {
        isFallback: newValue !== props.year,
        year: newValue
    });
}, { immediate: true });

const demographicSlice = computed(() => {
    const area = props.areaName.toUpperCase();
    const year = fallbackYear.value;

    if (!year) return undefined;

    if (area === "ALL SINGAPORE") {
        const relevant = dataStore.ethnicDistribution.filter(
            (d) => d.year === year
        );

        if (relevant.length === 0) return undefined;

        const total = relevant.reduce(
            (acc, curr) => ({
                chinese: acc.chinese + +curr.chinese,
                malays: acc.malays + +curr.malays,
                indian: acc.indian + +curr.indian,
                others: acc.others + +curr.others,
            }),
            { chinese: 0, malays: 0, indian: 0, others: 0 }
        );

        return {
            planningArea: "ALL SINGAPORE",
            year,
            ...total,
        };
    }

    return dataStore.ethnicDistribution.find(
        (d) => d.planningArea === area && d.year === year
    );
});

const hasData = computed(() => {
    return (
        demographicSlice.value &&
        demographicSlice.value.chinese !== undefined &&
        demographicSlice.value.malays !== undefined &&
        demographicSlice.value.indian !== undefined &&
        demographicSlice.value.others !== undefined
    );
});

const chartData = computed(() => {
    if (!hasData.value) return [];
    const d = demographicSlice.value;
    return [
        { type: "Chinese", value: d.chinese },
        { type: "Malay", value: d.malays },
        { type: "Indian", value: d.indian },
        { type: "Others", value: d.others },
    ];
});

const formatWithCommas = (value) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 0 });

const drawChart = () => {
    if (!chart.value || !hasData.value) return;

    d3.select(chart.value).selectAll("*").remove();

    const data = chartData.value;
    const totalValue = data.reduce((sum, d) => sum + d.value, 0);
    if (totalValue === 0) return;

    const width = chart.value.clientWidth;
    const height = chart.value.clientHeight;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    margin.bottom = 70;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chart.value)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand()
        .domain(data.map(d => d.type))
        .range([0, innerHeight])
        .padding(0.2);

    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([0, innerWidth]);

    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.type))
        .range(["#2563eb", "#16a34a", "#dc2626", "#9333ea"]);

    svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".2s")));

    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.type))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.value))
        .attr("fill", d => color(d.type))
        .style("opacity", 0.7)
        .on("mouseover", function (event, d) {
            d3.select(this).style("opacity", 1);
            if (tooltip.value) {
                tooltip.value.innerHTML = `${d.type}: <strong>${formatWithCommas(d.value)} (${(
                (d.value / totalValue) * 100
                ).toFixed(1)}%)</strong>`;
                tooltip.value.style.opacity = 1;
                positionTooltip(event, tooltip.value);
            }
            })
            .on("mousemove", function (event) {
            if (tooltip.value) {
                positionTooltip(event, tooltip.value);
            }
            })
            .on("mouseout", function () {
            d3.select(this).style("opacity", 0.7);
            if (tooltip.value) {
                tooltip.value.style.opacity = 0;
            }
        });

    // Optional axis labels
    svg.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + margin.bottom - 30)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .text("Population Count");
};


onMounted(async () => {
    await dataStore.ensureDataLoaded();
    drawChart();
});

watch(
    [
        () => demographicSlice.value,
        () => props.areaName,
        () => props.year,
        () => chart.value?.clientWidth,
        () => chart.value?.clientHeight,
    ],
    () => {
        drawChart();
    },
    { deep: true }
);

onUnmounted(() => {
    d3.select("body").selectAll(".tooltip").remove();
});

defineExpose({
    fallbackYear
});
</script>

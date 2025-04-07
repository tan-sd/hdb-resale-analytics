<template>
    <div ref="chartContainer" class="w-full h-full relative">
        <svg ref="chart" class="w-full h-full"></svg>
        <div
            ref="tooltip"
            class="absolute z-50 text-xs bg-white border border-gray-300 rounded px-2 py-1 shadow-md pointer-events-none"
            style="opacity: 0"
        ></div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted, defineEmits } from "vue";
import * as d3 from "d3";

const chartContainer = ref(null);
const chart = ref(null);
const tooltip = ref(null);
const rawData = ref(null);

const emit = defineEmits(["update:fallback-year"]);

const props = defineProps({
    areaName: {
        type: String,
        default: "All Singapore",
    },
    year: {
        type: String,
        default: 2023,
    },
});

const availableYears = [2000, 2005, 2010, 2015, 2020];

const fallbackYear = computed(() => {
    const inputYear = +props.year;
    const valid = availableYears.filter((y) => y <= inputYear);
    return valid.length > 0 ? Math.max(...valid) : null;
});

async function loadData() {
    try {
        rawData.value = await d3.csv(
            "data/population_demographics/age_group_population_by_year_planning_area.csv",
            d3.autoType
        );
        console.log("Data loaded:", rawData.value);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

const filteredData = computed(() => {
    if (!rawData.value) return [];

    const area = props.areaName.toUpperCase();
    const filtered = rawData.value.filter(
        (d) =>
            d.Year === fallbackYear.value &&
            (area === "ALL SINGAPORE" ||
                d["Planning Area"].toUpperCase() === area)
    );

    const aggregated = d3.rollups(
        filtered,
        (v) => d3.sum(v, (d) => d.Value),
        (d) => d["Age Range"]
    );

    return aggregated.map(([age, value]) => ({ age, value }));
});

const formatWithCommas = (value) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 0 });

function drawChart() {
    if (!chart.value) return;
    d3.select(chart.value).selectAll("*").remove();

    const data = filteredData.value;
    if (!data.length) return;

    const width = chart.value.clientWidth;
    const height = chart.value.clientHeight;
    const radius = Math.min(width, height) / 2 - 30;

    const svg = d3
        .select(chart.value)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 - 20})`);

    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.age))
        .range(d3.schemeSet2);

    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    svg.selectAll("path")
        .data(pie(data))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => color(d.data.age))
        .style("opacity", 0.8)
        .on("mouseover", function (event, d) {
            d3.select(this).style("opacity", 1);
            tooltip.value.innerHTML = `
          ${d.data.age}: <strong>${formatWithCommas(d.data.value)}</strong>
          (${((d.data.value / d3.sum(data, (d) => d.value)) * 100).toFixed(1)}%)
        `;
            tooltip.value.style.opacity = 1;
            positionTooltip(event, tooltip.value);
        })
        .on("mousemove", (event) => positionTooltip(event, tooltip.value))
        .on("mouseout", function () {
            d3.select(this).style("opacity", 0.8);
            tooltip.value.style.opacity = 0;
        });

    svg.selectAll("text")
        .data(pie(data))
        .enter()
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .attr("font-size", "10px")
        .attr("text-anchor", "middle")
        .text((d) => d.data.age);
}

function positionTooltip(event, tooltipElement) {
    if (!tooltipElement || !chartContainer.value) return;

    const chartRect = chartContainer.value.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    const relativeX = event.clientX - chartRect.left;
    const relativeY = event.clientY - chartRect.top;

    let top = relativeY - tooltipRect.height;
    let left = relativeX + 5;

    if (top < 0) top = relativeY + 20;
    if (left + tooltipRect.width > chartRect.width) {
        left = relativeX - tooltipRect.width - 5;
        if (left < 0) {
            left = Math.max(0, relativeX - tooltipRect.width / 2);
        }
    }

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
}

onMounted(async () => {
    await loadData();
    emit("update:fallback-year", {
        isFallback: fallbackYear.value !== +props.year,
        year: fallbackYear.value,
    });
    drawChart();
});

watch(
    () => [props.areaName, props.year],
    () => {
        drawChart();
    },
    { deep: true }
);

watch(
    fallbackYear,
    (newValue) => {
        emit("update:fallback-year", {
            isFallback: newValue !== +props.year,
            year: newValue,
        });
    },
    { immediate: true }
);

onUnmounted(() => {
    d3.select(tooltip.value).remove();
});
</script>

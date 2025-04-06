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
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import { useDataStore } from "@/stores/dataStore";
import * as d3 from "d3";

const chartContainer = ref(null);
const chart = ref(null);
const tooltip = ref(null);
const dataStore = useDataStore();

const props = defineProps({
    areaName: {
        type: String,
        default: "All Singapore",
    },
});

const formatWithCommas = (value) =>
    value.toLocaleString("en-US", { maximumFractionDigits: 0 });

const amenitiesData = computed(() => {
    if (!dataStore.amenitiesByPlanningArea) return [];

    const area = props.areaName.toUpperCase();
    if (area === "ALL SINGAPORE") {
        const aggregated = {};
        dataStore.amenitiesByPlanningArea.forEach((row) => {
            Object.keys(row).forEach((key) => {
                if (key !== "planning_area" && key !== "region") {
                    aggregated[key] = (aggregated[key] || 0) + +row[key];
                }
            });
        });
        return Object.entries(aggregated).map(([type, value]) => ({
            type,
            value,
        }));
    } else {
        const match = dataStore.amenitiesByPlanningArea.find(
            (d) => d.planning_area.toUpperCase() === area
        );
        if (!match) return [];
        return Object.entries(match)
            .filter(([key]) => key !== "planning_area" && key !== "region")
            .map(([type, value]) => ({ type, value: +value }));
    }
});

const positionTooltip = (event, tooltipElement) => {
    if (!tooltipElement || !chartContainer.value) return;

    const chartRect = chartContainer.value.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();

    const relativeX = event.clientX - chartRect.left;
    const relativeY = event.clientY - chartRect.top;

    const top = relativeY - tooltipRect.height - 10;
    const left = relativeX + 10;

    tooltipElement.style.top = `${top}px`;
    tooltipElement.style.left = `${left}px`;
};

const drawChart = () => {
    if (!chart.value) return;
    d3.select(chart.value).selectAll("*").remove();

    const data = [...amenitiesData.value].sort((a, b) => b.value - a.value);
    if (data.length === 0) return;

    const width = chart.value.clientWidth;
    const height = chart.value.clientHeight;
    const margin = { top: 20, right: 30, bottom: 60, left: 100 };

    margin.bottom = 70;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
        .select(chart.value)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const labelMap = {
        num_malls: "Malls",
        num_mrt: "MRT Stations",
        num_primary_schools: "Primary Schools",
        num_secondary_schools: "Secondary Schools",
        num_polytechnics: "Polytechnics",
        num_junior_colleges: "Junior Colleges",
        num_universities: "Universities",
        num_parks: "Parks",
        num_gyms: "Gyms",
        num_hawker_centres: "Hawker Centres",
    };

    const y = d3
        .scaleBand()
        .domain(data.map((d) => labelMap[d.type] || d.type))
        .range([0, innerHeight])
        .padding(0.2);

    const x = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d.value)])
        .nice()
        .range([0, innerWidth]);

    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.type))
        .range(d3.schemeTableau10);

    svg.append("g").call(d3.axisLeft(y));

    const tickCount = window.innerWidth < 1024 ? 7 : 4;

    svg.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x).ticks(tickCount));

    svg.append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Count");

    svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", (d) => y(labelMap[d.type] || d.type))
        .attr("x", 0)
        .attr("height", y.bandwidth())
        .attr("width", (d) => x(d.value))
        .attr("fill", (d) => color(d.type))
        .style("opacity", 0.8)
        .on("mouseover", function (event, d) {
            d3.select(this).style("opacity", 1);
            tooltip.value.innerHTML = `${
                labelMap[d.type] || d.type
            }: <strong>${formatWithCommas(d.value)}</strong>`;
            tooltip.value.style.opacity = 1;
            positionTooltip(event, tooltip.value);
        })
        .on("mousemove", (event) => positionTooltip(event, tooltip.value))
        .on("mouseout", function () {
            d3.select(this).style("opacity", 0.8);
            tooltip.value.style.opacity = 0;
        });
};

onMounted(() => {
    drawChart();
});

watch(
    [() => props.areaName, () => dataStore.amenitiesByPlanningArea],
    () => drawChart(),
    { deep: true }
);

onUnmounted(() => {
    d3.select(tooltip.value).remove();
});
</script>

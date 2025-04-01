<template>
    <div class="w-full h-full">
        <svg ref="chart" class="w-full h-full"></svg>
        <div
            v-if="fallbackYear !== props.year"
            class="text-center text-xs text-muted-foreground mb-1"
        >
            {{ fallbackYear }} Demographic Data
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from "vue";
import { useDataStore } from "@/stores/dataStore";
import * as d3 from "d3";

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
        type: Number,
        default: 2023,
    },
});

const chart = ref(null);
const dataStore = useDataStore();
const demographicYears = [2000, 2005, 2010, 2015, 2020];

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

const fallbackYear = computed(() => {
    const inputYear = props.year;
    const valid = demographicYears.filter((y) => y <= inputYear);
    return valid.length > 0 ? Math.max(...valid) : null;
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
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const radius = Math.min(width, height) / 2 - margin.top;

    const svg = d3
        .select(chart.value)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.type))
        .range(["#2563eb", "#16a34a", "#dc2626", "#9333ea"]);

    const pie = d3
        .pie()
        .value((d) => d.value)
        .sort(null);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const outerArc = d3
        .arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const tooltipClass = `tooltip-${Date.now()}`;

    d3.select("body").selectAll(`.${tooltipClass}`).remove();

    const tooltip = d3
        .select("body")
        .append("div")
        .attr("class", tooltipClass)
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "5px")
        .style("border", "1px solid #ccc")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 1000);

    const slices = svg
        .selectAll(".slice")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "slice");

    slices
        .append("path")
        .attr("d", arc)
        .attr("fill", (d) => color(d.data.type))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)
        .on("mouseover", function (event, d) {
            d3.select(this).style("opacity", 1);
            tooltip.transition().duration(200).style("opacity", 0.9);

            tooltip
                .html(
                    `${d.data.type}: ${formatWithCommas(d.data.value)} (${(
                        (d.data.value / totalValue) *
                        100
                    ).toFixed(1)}%)`
                )
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
            d3.select(this).style("opacity", 0.7);
            tooltip.transition().duration(500).style("opacity", 0);
        });

    slices
        .filter((d) => d.data.value / totalValue > 0.05)
        .append("text")
        .attr("transform", (d) => {
            const pos = outerArc.centroid(d);
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radius * 0.7 * (midAngle < Math.PI ? 1 : -1);
            return `translate(${pos})`;
        })
        .attr("dy", ".35em")
        .style("text-anchor", (d) => {
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return midAngle < Math.PI ? "start" : "end";
        })
        .style("font-size", "10px")
        .text((d) => d.data.type);

    slices
        .filter((d) => d.data.value / totalValue > 0.05)
        .append("polyline")
        .attr("points", (d) => {
            const pos = outerArc.centroid(d);
            const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = radius * 0.7 * (midAngle < Math.PI ? 1 : -1);
            return [arc.centroid(d), outerArc.centroid(d), pos];
        })
        .style("fill", "none")
        .style("stroke", "gray")
        .style("stroke-width", "1px");
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
</script>

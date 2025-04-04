<template>
    <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
        <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">
            Distance to Primary School with HDB Resale Price Trend
        </h3>
        <div id="box-plot" ref="chartWrapper" class="w-full relative">
            <svg ref="svg" class="w-full h-full"></svg>
        </div>
    </div>
</template>

<script setup>
    import * as d3 from "d3";
    import { onMounted, watch, ref, nextTick } from "vue";
    import { useDataStore } from "@/stores/dataStore";

    const svg = ref(null);
    const chartWrapper = ref(null);
    const width = ref(800);
    const height = ref(500);
    const margin = { top: 50, right: 90, bottom: 90, left: 70 };
    const store = useDataStore();

    function setDimensions() {
        if (!chartWrapper.value) return;

    const widthAvailable = chartWrapper.value.clientWidth;
        if (widthAvailable === 0) return;

    width.value = widthAvailable - margin.left - margin.right;
        height.value = 500;
    }

    function resizeAndRedraw() {
        requestAnimationFrame(() => {
            setDimensions();
            drawChart();
        });
    }

    function drawChart() {
    const data = store.hsdResaleTrend;
    if (!svg.value || !data.length) return;

    d3.select(svg.value).selectAll("*").remove(); // Clear existing chart

    const totalWidth = width.value + margin.left + margin.right;
    const totalHeight = height.value + margin.top + margin.bottom;

    const chart = d3.select(svg.value)
        .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width.value]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height.value, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const tiers = Array.from(new Set(data.map(d => d.tier)));

    const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value));

    for (const tier of tiers) {
        const tierData = data.filter(d => d.tier === tier);

    chart.append("path")
        .datum(tierData)
        .attr("fill", "none")
        .attr("stroke", color(tier))
        .attr("stroke-width", 2)
        .attr("d", line);

    chart.append("text")
        .attr("x", x(tierData[tierData.length - 1].year) + 5)
        .attr("y", y(tierData[tierData.length - 1].value))
        .attr("dy", "0.35em")
        .style("font-size", "12px")
        .style("fill", color(tier))
        .text(tier);
    }

    chart.append("g")
        .attr("transform", `translate(0,${height.value})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("d")))
        .selectAll("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-45)")
        .attr("dx", "-0.8em")
        .attr("dy", "0.15em");

    chart.append("g").call(d3.axisLeft(y));

    d3.select(svg.value)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", margin.left + width.value / 2)
        .attr("y", totalHeight - 5)
        .style("fill", "#4b5563")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .text("Year");

    d3.select(svg.value)
        .append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", -margin.top - height.value / 2)
        .attr("y", 15)
        .style("fill", "#4b5563")
        .style("font-size", "12px")
        .style("font-weight", "500")
        .text("Median Resale Price");

    const milestoneYears = {
        2009:"2009: HSD awareness spike", 
        2013:"2013: Balloting Update", 
        2022:"2022: HSD tightened"

    };
    const milestones = Object.entries(milestoneYears);

    chart.selectAll(".milestone-line")
        .data(milestones)
        .enter()
        .append("line")
        .attr("class", "milestone-line")
        .attr("x1", d => x(+d[0]))
        .attr("x2", d => x(+d[0]))
        .attr("y1", 0)
        .attr("y2", height.value)
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4 2");

    const milestoneYOffsets = {
        2009: -5,
        2013: -20, // Shift higher
        2022: -5
    };

    chart.selectAll(".milestone-label")
        .data(milestones)
        .enter()
        .append("text")
        .attr("x", d => x(+d[0]))
        .attr("y", d => milestoneYOffsets[d[0]] ?? -5)
        .attr("text-anchor", "middle")
        .style("fill", "#555")
        .style("font-size", "10px")
        .text(d => d[1]);



}

onMounted(async () => {
    await nextTick();
    resizeAndRedraw();

    window.addEventListener("resize", () => {
        resizeAndRedraw();
    });
});

watch(
    () => store.hsdResaleTrend,
    (val) => {
        if (val.length > 0) {
        resizeAndRedraw();
        }
    },
    { immediate: true }
);

</script>

<style scoped>
    .chart-container {
    width: 100%;
    height: auto;
    }

    #hsd-line-chart {
    width: 100%;
    height: 100%;
    position: relative;
    }
</style>


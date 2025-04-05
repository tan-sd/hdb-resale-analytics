<template>
    <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
        <h3 class="text-sm text-center tracking-wide font-semibold">
        Population Distribution of HDB 1- And 2-Room Flats by Age Group Category
        </h3>
        <div id="line-chart" ref="chartWrapper" class="w-full relative">
        <svg ref="svg" class="w-full h-full"></svg>
        </div>
    </div>
</template>

<script>
    import * as d3 from "d3";
    import { ref, onMounted, nextTick, watch } from "vue";
    import { useDataStore } from "@/stores/dataStore";

    export default {
    name: "LineChartAgeAndDwelling",
    setup() {
        const svg = ref(null);
        const chartWrapper = ref(null);
        const width = ref(800);
        const height = ref(500);
        const margin = { top: 40, right: 100, bottom: 90, left: 80 };

        // Access the dataStore
        const dataStore = useDataStore();
        const ageAndDwellingTypeData = dataStore.ageAndDwellingTypeData;

        const setDimensions = () => {
        if (!chartWrapper.value) return;
        const widthAvailable = chartWrapper.value.clientWidth;
        if (widthAvailable === 0) return;
        width.value = widthAvailable - margin.left - margin.right;
        height.value = 500;
        };

        const drawChart = (data) => {
        if (!data || data.length === 0) {
            console.warn("No data available for the chart.");
            return;
        }

        // Parse and filter data
        data.forEach((d) => {
            d.Year = +d.Year; // Convert Year to a number
            d.Population = +d.Population; // Convert Population to a number
        });
        data = data.filter((d) => !isNaN(d.Year) && !isNaN(d.Population));

        console.log("Processed Data:", data);

        const svgEl = d3.select(svg.value);
        svgEl.selectAll("*").remove();

        const totalWidth = width.value + margin.left + margin.right;
        const totalHeight = height.value + margin.top + margin.bottom;

        const g = svgEl
            .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Scales
        const x = d3
            .scaleLinear()
            .domain(d3.extent(data, (d) => d["Year"]))
            .range([0, width.value]);

        const y = d3
            .scaleLinear()
            .domain([
                // d3.min(data, (d) => d["Population"]),
                0,
                d3.max(data, (d) => d["Population"]) * 1.1,
            ])
            .range([height.value, 0]);

        console.log("X Scale Domain:", x.domain());
        console.log("Y Scale Domain:", y.domain());

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${height.value})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("font-size", "10px");

        g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "10px");

        // Define color scale
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Group data by Age Group Category
        const groupedData = d3.group(data, (d) => d["Age Group Category"]);

        // Draw lines for each age group
        groupedData.forEach((values, key) => {
            const sanitizedKey = key.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();

            // Draw the line
            g.append("path")
                .datum(values)
                .attr("fill", "none")
                .attr("stroke", colorScale(key))
                .attr("stroke-width", 2)
                .attr(
                    "d",
                    d3
                        .line()
                        .x((d) => x(d["Year"]))
                        .y((d) => y(d["Population"]))
                        .curve(d3.curveMonotoneX)
                );

            // Add circles at each data point
            g.selectAll(`.dot-${sanitizedKey}`)
                .data(values)
                .enter()
                .append("circle")
                .attr("class", `dot-${sanitizedKey}`)
                .attr("cx", (d) => x(d["Year"]))
                .attr("cy", (d) => y(d["Population"]))
                .attr("r", 3)
                .attr("fill", colorScale(key));

            // Add a label at the end of each line
            g.append("text")
                .datum(values[values.length - 1])
                .attr("x", x(values[values.length - 1]["Year"]) + 5)
                .attr("y", y(values[values.length - 1]["Population"]))
                .style("fill", colorScale(key))
                .style("font-size", "10px")
                .text(key);
        });

        // Add labels
        svgEl
            .append("text")
            .attr("text-anchor", "middle")
            .attr("x", margin.left + width.value / 2)
            .attr("y", totalHeight - 10)
            .style("fill", "#4b5563")
            .style("font-size", "12px")
            .style("font-weight", "500")
            .text("Year");

        svgEl
            .append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -margin.top - height.value / 2)
            .attr("y", 10)
            .style("fill", "#4b5563")
            .style("font-size", "12px")
            .style("font-weight", "500")
            .text("Population");
    };


        onMounted(async () => {
        await dataStore.ensureDataLoaded(); // Ensure data is loaded
        console.log("Data loaded:", ageAndDwellingTypeData);
        await nextTick();
        setDimensions();

        drawChart(ageAndDwellingTypeData || []);

        window.addEventListener("resize", () => {
            setDimensions();
            drawChart(ageAndDwellingTypeData || []);
        });
        });

        // Watch for changes in the data and redraw the chart
        watch(
        () => ageAndDwellingTypeData,
        (newData) => {
            if (newData && newData.length > 0) {
            setDimensions();
            drawChart(newData);
            }
        },
        { immediate: true }
        );

        return {
        svg,
        chartWrapper,
        };
    },
    };
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: auto;
}

.line {
    stroke: steelblue;
    stroke-width: 2;
}
</style>
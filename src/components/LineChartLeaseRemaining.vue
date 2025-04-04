<template>
    <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
        <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">
        Median Resale Price (2024 Adj) vs Years Remaining on Lease
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
    name: "LineChartLeaseRemaining",
    setup() {
        const svg = ref(null);
        const chartWrapper = ref(null);
        const width = ref(800);
        const height = ref(500);
        const margin = { top: 40, right: 70, bottom: 90, left: 70 };

        // Access the dataStore
        const dataStore = useDataStore();
        const leaseTrend = dataStore.leaseTrend;

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
            .domain(d3.extent(data, (d) => d["Years Remaining"]))
            .range([width.value, 0]);

        const y = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(data, (d) => d["Resale Price Adj 2024"]) * 1.1, // Add 10% padding to the top
            ])
            .range([height.value, 0]);

        // Axes
        g.append("g")
            .attr("transform", `translate(0,${height.value})`)
            .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("font-size", "10px");

        g.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "10px");

        // Line generator
        const line = d3
            .line()
            .x((d) => x(d["Years Remaining"]))
            .y((d) => y(d["Resale Price Adj 2024"]))
            .curve(d3.curveMonotoneX);

        // Draw the line
        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#60a5fa")

            .attr("stroke-width", 2)
            .attr("d", line);

          // Add reference lines
        const referenceYears = [
            { year: 50, label: "CPF and Loan Eligibility Restrictions" },
            { year: 99, label: "Newer Flats Premium" },
        ];
        referenceYears.forEach((ref) => {
            // Add dotted line
            g.append("line")
                .attr("x1", x(ref.year))
                .attr("x2", x(ref.year))
                .attr("y1", 0)
                .attr("y2", height.value)
                .attr("stroke", "#999") // Light gray color
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "4 4"); // Dotted line

            // Add label
            g.append("text")
                .attr("x", x(ref.year) + 5) // Slightly offset from the line
                .attr("y", 20) // Fixed vertical position for all labels
                .style("fill", "#555") // Dark gray color
                .style("font-size", "10px")
                .text(ref.label);
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
            .text("Years Remaining on Lease");

        svgEl
            .append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -margin.top - height.value / 2)
            .attr("y", 15)
            .style("fill", "#4b5563")
            .style("font-size", "12px")
            .style("font-weight", "500")
            .text("Resale Price (2024 Adjusted)");
        };


        onMounted(async () => {
        await dataStore.ensureDataLoaded(); // Ensure data is loaded
        await nextTick();
        setDimensions();

        drawChart(leaseTrend || []);

        window.addEventListener("resize", () => {
            setDimensions();
            drawChart(leaseTrend || []);
        });
        });

        // Watch for changes in the data and redraw the chart
        watch(
        () => leaseTrend,
        (newData) => {
            if (newData && newData.length > 0) {
            // console.log("Lease Trend Data updated:", newData);
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

#line-chart-median{
    width: 100%;
    height: 100%;
    position: relative;
}

.line {
    stroke: steelblue;
    stroke-width: 2;
}
</style>
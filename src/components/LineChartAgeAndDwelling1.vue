<template>
    <div
        class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4"
    >
        <h3 class="text-sm text-center tracking-wide font-semibold">
            Population Percentage of HDB 1- And 2-Room Flats by Age Group
            Category
        </h3>
        <div id="line-chart" ref="chartWrapper" class="w-full relative">
            <svg ref="svg" class="w-full h-full"></svg>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3";
import { ref, onMounted, nextTick, watch, watchEffect } from "vue";
import { useDataStore } from "@/stores/dataStore";

export default {
    name: "LineChartAgeAndDwelling",
    setup() {
        const svg = ref(null);
        const chartWrapper = ref(null);
        const width = ref(800);
        const height = ref(500);
        const margin = { top: 40, right: 100, bottom: 90, left: 80 };
        const flatData = ref([]);
        const totalData = ref([]);

        // Access the dataStore
        const dataStore = useDataStore();

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
                d.Year = +d.Year;
                d.Percentage = +d.Percentage;
            });

            data = data.filter((d) => !isNaN(d.Year) && !isNaN(d.Percentage));

            // console.log("Processed Data:", data);

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
                    d3.max(data, (d) => d.Percentage) * 1.1,
                ])
                .range([height.value, 0]);

            // console.log("X Scale Domain:", x.domain());
            // console.log("Y Scale Domain:", y.domain());

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
                const sanitizedKey = key
                    .replace(/[^a-zA-Z0-9]/g, "-")
                    .toLowerCase();

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
                            .y((d) => y(d.Percentage))
                            .curve(d3.curveMonotoneX)
                    );

                // Add circles at each data point
                g.selectAll(`.dot-${sanitizedKey}`)
                    .data(values)
                    .enter()
                    .append("circle")
                    .attr("class", `dot-${sanitizedKey}`)
                    .attr("cx", (d) => x(d["Year"]))
                    .attr("cy", (d) => y(d.Percentage))
                    .attr("r", 3)
                    .attr("fill", colorScale(key));

                // Add a label at the end of each line
                // g.append("text")
                //     .datum(values[values.length - 1])
                //     .attr("x", x(values[values.length - 1]["Year"]) + 5)
                //     .attr("y", y(values[values.length - 1].Percentage))
                //     .style("fill", colorScale(key))
                //     .style("font-size", "10px")
                //     .text(key);
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
                .text("Percentage of Age Group (%)");

            // Friendly label mapping
            const legendLabelMap = {
                "0-24 Years": "Young (0-24)",
                "Adults (25-59 Years)": "Adults (25-59)",
                "Seniors (60+ Years)": "Seniors (60+)",
            };

            // Legend items
            const legendItems = Array.from(groupedData.keys());

            // Estimate legend height
            const legendHeight = legendItems.length * 20;
            const legendPadding = 20;

            // Bottom-right position
            const legendX = margin.left + width.value - 150; // adjust horizontal offset
            const legendY =
                margin.top + height.value - legendHeight - legendPadding;

            const legend = svgEl
                .append("g")
                .attr("transform", `translate(${legendX}, ${legendY})`);

            legendItems.forEach((key, i) => {
                const yOffset = i * 20;

                // Color box
                legend
                    .append("rect")
                    .attr("x", 0)
                    .attr("y", yOffset)
                    .attr("width", 12)
                    .attr("height", 12)
                    .attr("fill", colorScale(key));

                // Label text
                legend
                    .append("text")
                    .attr("x", 18)
                    .attr("y", yOffset + 10)
                    .style("font-size", "11px")
                    .style("fill", "#374151")
                    .text(legendLabelMap[key] || key);
            });
        };

        function remapFlatDataAgeGroups(data) {
            const ageGroupMap = {
                "Children (0-14 Years)": "0-24 Years",
                "Youth (15-24 Years)": "0-24 Years",
                "Adults (25-59 Years)": "Adults (25-59 Years)",
                "Seniors (60+ Years)": "Seniors (60+ Years)",
            };

            const grouped = d3.rollups(
                data,
                (v) => d3.sum(v, (d) => +d.Population),
                (d) =>
                    `${d.Year}_${
                        ageGroupMap[d["Age Group Category"]] ||
                        d["Age Group Category"]
                    }`
            );

            return grouped.map(([key, total]) => {
                const [year, group] = key.split("_");
                return {
                    Year: +year,
                    "Age Group Category": group,
                    Population: total,
                };
            });
        }

        function calculatePercentage(flatData, totalPopData) {
            const totalPopMap = new Map();

            // Build lookup: (year, age group category) -> total population
            for (const row of totalPopData) {
                const key = `${row.Year}_${row["Age Group Category"]}`;
                totalPopMap.set(key, +row.Population);
            }

            // Compute percentage for each data row
            return flatData.map((row) => {
                const key = `${row.Year}_${row["Age Group Category"]}`;
                const total = totalPopMap.get(key) || 0;
                const percentage =
                    total === 0
                        ? 0
                        : (Number(row.Population) / Number(total)) * 100;

                // 🔍 Log calculation for debugging
                // console.log(`[${row.Year}] ${row["Age Group Category"]}: ${row.Population} / ${total} = ${percentage.toFixed(2)}%`);

                return {
                    Year: +row.Year,
                    "Age Group Category": row["Age Group Category"],
                    Percentage: percentage,
                };
            });
        }

        onMounted(async () => {
            await dataStore.ensureDataLoaded();
            await nextTick();
            setDimensions();

            if (
                Array.isArray(flatData.value) &&
                flatData.value.length &&
                Array.isArray(totalData.value) &&
                totalData.value.length
            ) {
                const percentageData = calculatePercentage(
                    remapFlatDataAgeGroups(flatData.value),
                    totalData.value
                );
                drawChart(percentageData);

                window.addEventListener("resize", () => {
                    setDimensions();
                    const updatedPercentageData = calculatePercentage(
                        remapFlatDataAgeGroups(flatData.value),
                        totalData.value
                    );
                    drawChart(updatedPercentageData);
                });
            } else {
                console.warn("Data not ready yet:", {
                    flatData: flatData.value,
                    totalData: totalData.value,
                });
            }
        });

        watchEffect(() => {
            flatData.value = dataStore.flatAgeDist_1and2;
            totalData.value = dataStore.totalHdbPop;
        });

        watch(
            () => [flatData.value, totalData.value],
            ([newFlat, newTotal]) => {
                if (
                    Array.isArray(newFlat) &&
                    newFlat.length &&
                    Array.isArray(newTotal) &&
                    newTotal.length
                ) {
                    setDimensions();
                    const percentageData = calculatePercentage(
                        newFlat,
                        newTotal
                    );
                    drawChart(percentageData);
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

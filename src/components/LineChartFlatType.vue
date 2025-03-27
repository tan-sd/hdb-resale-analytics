<template>
    <div ref="chartContainer" class="chart-container relative flex flex-col items-center justify-center">
        <h3 class="text-sm mb-2 text-center">Median HDB Resale Price per Year by Flat Type</h3>
        <div id="line-chart">
            <svg
                viewbox="0 0 1000 600"
                :width="width + margin.left + margin.right"
                :height="height + margin.top + margin.bottom"
            >
                <g :transform="`translate(${margin.left},${margin.top})`" />
            </svg>
        </div>
        <div
            id="tooltip-median"
            style="position: absolute; padding: 8px; background: rgba(0, 0, 0, 0.7); color: white; border-radius: 5px; display: none;"
        ></div>
    </div>
</template>

<script>
import * as d3 from "d3";
import { useDataStore } from "@/stores/dataStore";
import { gsap } from "gsap";
import { watch } from "vue";

export default {
    name: "LineChartFlatType",
    data() {
        return {
            margin: { top: 20, right: 30, bottom: 40, left: 60 },
            width: 0,
            height: 0,
            dotSelection: [],
            lineSelection: [],
        };
    },
    computed: {
        chartData() {
            const store = useDataStore();
            return store.yearFlatTypeMedians || [];
        },
        isDataLoader() {
            return this.chartData.length > 0;
        },
    },
    mounted() {
        this.setDimensions();
        window.addEventListener("resize", this.setDimensions);

        const dataStore = useDataStore();

        watch(
            () => dataStore.isDataReady,
            (isReady) => {
            if (isReady) {
                this.createChart();
            }
            },
            { immediate: true }
        );
    },
    methods: {
        setDimensions() {
            const container = this.$el.querySelector("#line-chart");
            if (container) {
                this.width =
                    container.clientWidth -
                    this.margin.left -
                    this.margin.right;
                this.height =
                    container.clientHeight -
                    this.margin.top -
                    this.margin.bottom;
            }
        },

        createChart() {
            const yearFlatTypeMedians = this.chartData;

            if (!yearFlatTypeMedians.length) {
                console.error("No data available to render the chart.");
                return;
            }

            const x = d3.scaleTime()
                .domain(d3.extent(yearFlatTypeMedians, (d) => new Date(d.Year, 0)))
                .range([0, this.width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(yearFlatTypeMedians, (d) => d.median)])
                .range([this.height, 0]);

            const svg = d3.select(this.$el).select("svg").select("g");

            svg.append("g")
                .attr("transform", `translate(0,${this.height})`)
                .call(d3.axisBottom(x));

            svg.append("g").call(d3.axisLeft(y));

            const color = d3.scaleOrdinal(d3.schemeCategory10);
            const line = d3.line()
                .x((d) => x(new Date(d.Year, 0)))
                .y((d) => y(d.median));

            const flatTypes = Array.from(new Set(yearFlatTypeMedians.map((d) => d.FlatType)));

            flatTypes.forEach((flatType) => {
                const flatTypeData = yearFlatTypeMedians.filter((d) => d.FlatType === flatType);

                const linePath = svg.append("path")
                    .datum(flatTypeData)
                    .attr("class", "line")
                    .attr("d", line)
                    .style("fill", "none")
                    .style("stroke", color(flatType))
                    .style("stroke-width", 2);

                this.lineSelection.push(linePath);
            });

            const tooltip = d3.select("#tooltip-median");

            this.dotSelection = svg
                .selectAll(".dot")
                .data(yearFlatTypeMedians)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("r", 4)
                .attr("cx", (d) => x(new Date(d.Year, 0)))
                .attr("cy", (d) => y(d.median))
                .style("fill", "red")
                .style("opacity", 0)
                .on("mouseover", (event, d) => {
                    tooltip.style("display", "inline-block").html(
                        `Flat Type: ${d.FlatType}<br>Year: ${d.Year}<br>Median Price: <span class="tracking-wider">$${new Intl.NumberFormat(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                        }).format(d.median)}</span>`
                    );
                    d3.select(event.target).attr("r", 6);
                })
                .on("mousemove", function (event) {
                    const [mouseX, mouseY] = d3.pointer(event, this);

                    tooltip
                        .style("top", `${mouseY - 30}px`)
                        .style("left", `${mouseX + 10}px`);
                })
                .on("mouseout", (event) => {
                    tooltip.style("display", "none");

                    d3.select(event.target).attr("r", 4);
                });
            },
    }
};
</script>

<style scoped>
.chart-container {
    position: relative;
    width: 100%;
    max-width: 800px;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
}

#line-chart {
    flex: 1;
    width: 100%;
    height: 100%;
    position: relative;
}

.line {
    stroke: steelblue;
    stroke-width: 2;
}

.dot {
    fill: red;
}

.dot:hover {
    fill: orange;
}
</style>

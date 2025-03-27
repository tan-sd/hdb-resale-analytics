<template>
    <div class="chart-container relative flex flex-col items-center justify-center">
        <h3 class="text-sm mb-2 text-center">Resale Price vs Storey</h3>
        <div id="line-chart">
            <svg
                viewbox="0 0 1000 600"
                :width="width + margin.left + margin.right"
                :height="height + margin.top + margin.bottom"
            >
                <g
                    :transform="
                        'translate(' + margin.left + ',' + margin.top + ')'
                    "
                />
            </svg>
        </div>
        <div
            id="tooltip-median"
            style="
                position: absolute;
                padding: 8px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border-radius: 5px;
                display: none;
            "
        ></div>
    </div>
</template>

<script>
import * as d3 from "d3";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);
import { watch } from "vue";
import { useDataStore } from "../stores/dataStore";

export default {
    name: "ScatterPlotStories",
    data() {
        return {
            margin: { top: 20, right: 30, bottom: 40, left: 60 },
            width: 0,
            height: 0,
            data: [],
            dotSelection: [],
        };
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
            const allData = this.chartData;

            const x = d3.scaleLinear()
                .domain([d3.min(allData, (d) => d.AvgStorey), d3.max(allData, (d) => d.AvgStorey)])
                .range([0, this.width]);

            const y = d3.scaleLinear()
                .domain([0, d3.max(allData, (d) => d.ResalePrice)])
                .range([this.height, 0]);

            const svg = d3.select(this.$el).select("svg").select("g");

            svg.append("g")
                .attr("transform", `translate(0,${this.height})`)
                .call(d3.axisBottom(x));

            svg.append("g").call(d3.axisLeft(y));

            this.dotSelection = svg
                .selectAll(".dot")
                .data(allData)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("r", 4)
                .attr("cx", (d) => x(d.AvgStorey))
                .attr("cy", (d) => y(d.ResalePrice))
                .style("fill", "steelblue")
                .style("opacity", 0.2);

            const xValues = allData.map((d) => d.AvgStorey);
            const yValues = allData.map((d) => d.ResalePrice);

            const n = xValues.length;
            const sumX = d3.sum(xValues);
            const sumY = d3.sum(yValues);
            const sumX2 = d3.sum(xValues.map((x) => x * x));
            const sumXY = d3.sum(xValues.map((x, i) => x * yValues[i]));

            const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            const b = (sumY - m * sumX) / n;

            const lineData = xValues.map((x) => ({
                x: x,
                y: m * x + b,
            }));

            const line = d3.line()
                .x((d) => x(d.x))
                .y((d) => y(d.y));

            svg.append("path")
                .data([lineData])
                .attr("class", "regression-line")
                .attr("d", line)
                .style("fill", "none")
                .style("stroke", "red")
                .style("stroke-width", 2);

            const tooltip = d3.select("#tooltip-median");

            this.dotSelection
                .on("mouseover", (event, d) => {
                    tooltip.style("display", "inline-block").html(
                        `Avg Storey: ${d.AvgStorey}<br>Resale Price: <span class="tracking-wider">$${new Intl.NumberFormat(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                        }).format(d.ResalePrice)}</span>`
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
    },
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

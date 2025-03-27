<template>
    <div class="chart-container relative flex flex-col items-center justify-center">
        <h3 class="text-sm mb-2 text-center">Median HDB Resale Price per Year</h3>
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
    name: "LineChartMedian",
    props: {
        highlightYears: {
            type: Array,
            default: () => [],
        },
        shouldHighlight: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            margin: { top: 20, right: 30, bottom: 40, left: 60 },
            width: 0,
            height: 0,
            data: [],
            dotSelection: [],
        };
    },
    computed: {
        chartData() {
            const store = useDataStore();
            return store.yearMedians || [];
        },
        isDataLoader() {
            return this.chartData.length > 0;
        }
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
            const yearMedians = this.chartData;

            if (!yearMedians.length) {
                console.error("No data available to render the chart.");
                return;
            }

            const x = d3
                .scaleTime()
                .domain(d3.extent(yearMedians, (d) => new Date(d.Year, 0)))
                .range([0, this.width]);

            const y = d3
                .scaleLinear()
                .domain([0, d3.max(yearMedians, (d) => d.median)])
                .range([this.height, 0]);

            const highlightRange = () => {
                svg.selectAll(".highlight-rect").remove();

                if (this.shouldHighlight && this.highlightYears.length < 34) {
                    const minYear = d3.min(this.highlightYears);
                    const maxYear = d3.max(this.highlightYears);

                    svg.insert("rect", ":first-child")
                        .attr("class", "highlight-rect")
                        .attr("x", x(new Date(minYear, 0)))
                        .attr("y", 0)
                        .attr(
                            "width",
                            x(new Date(maxYear, 0)) - x(new Date(minYear, 0))
                        )
                        .attr("height", this.height)
                        .attr("fill", "#fef3c7")
                        .attr("opacity", 0.4);
                }
            };

            const svg = d3.select(this.$el).select("svg").select("g");

            svg.append("g")
                .attr("transform", `translate(0,${this.height})`)
                .call(d3.axisBottom(x));

            svg.append("g").call(d3.axisLeft(y));

            const line = d3
                .line()
                .x((d) => x(new Date(d.Year, 0)))
                .y((d) => y(d.median));

            const path = svg
                .append("path")
                .data([yearMedians])
                .attr("class", "line")
                .attr("d", line)
                .style("fill", "none")
                .style("stroke", "steelblue")
                .style("stroke-width", 2);

            const pathElement = path.node();
            const totalLength = pathElement.getTotalLength();

            path.attr("stroke-dasharray", `${totalLength} ${totalLength}`).attr(
                "stroke-dashoffset",
                totalLength
            );

            const tooltip = d3.select("#tooltip-median");

            this.dotSelection = svg
                .selectAll(".dot")
                .data(yearMedians)
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
                        `Year: ${
                            d.Year
                        }<br>Median Price: <span class="tracking-wider">$${new Intl.NumberFormat(undefined, {
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
                .on("mouseout", (event, d) => {
                    tooltip.style("display", "none");

                    const isHighlighted =
                        this.shouldHighlight &&
                        this.highlightYears.includes(d.Year);
                    d3.select(event.target).attr("r", isHighlighted ? 5 : 3);
                });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#chart-container",
                    start: "top 80%",
                    toggleActions: "play none none none",
                },
            });

            tl.to(pathElement, {
                strokeDashoffset: 0,
                duration: 3,
                ease: "power2.out",
            });

            watch(
                () => [this.highlightYears, this.shouldHighlight],
                ([newYears, highlight]) => {
                    if (!this.dotSelection) return;

                    highlightRange();

                    this.dotSelection
                        .transition()
                        .duration(300)
                        .style("opacity", (d) =>
                            highlight
                                ? newYears.includes(d.Year)
                                    ? 1
                                    : 0.4
                                : 1
                        )
                        .attr("r", (d) =>
                            highlight ? (newYears.includes(d.Year) ? 5 : 3) : 4
                        );
                },
                { immediate: true, deep: true }
            );
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

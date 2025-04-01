<template>
    <div
        class="chart-container relative flex flex-col items-center justify-center"
    >
        <p class="text-sm mb-1 text-center tracking-wide font-semibold">
            HDB Resale Transactions per Year
        </p>
        <div id="line-chart-transaction" ref="chartContainer">
            <svg
                :viewBox="`0 0 ${width + margin.left + margin.right} ${
                    height + margin.top + margin.bottom
                }`"
                preserveAspectRatio="xMidYMid meet"
                class="w-full h-auto"
            >
                <g
                    class="chart-group"
                    :transform="
                        'translate(' + margin.left + ',' + margin.top + ')'
                    "
                />
            </svg>
        </div>
        <div
            id="tooltip-transaction"
            ref="tooltip"
            style="
                position: absolute;
                padding: 5px 10px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border-radius: 5px;
                display: none;
                z-index: 1000;
                pointer-events: none;
                max-width: 300px;
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
    name: "LineChartTransaction",
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
            margin: { top: 20, right: 30, bottom: 40, left: 70 },
            width: 0,
            height: 0,
            dotSelection: [],
        };
    },
    computed: {
        chartData() {
            const store = useDataStore();
            return store.yearCounts || [];
        },
        isDataLoader() {
            return this.chartData.length > 0;
        },
    },
    mounted() {
        this.setDimensions();
        window.addEventListener("resize", this.handleResize);

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
    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
    methods: {
        handleResize() {
            this.setDimensions();
            d3.select(this.$el)
                .select("svg")
                .select("g")
                .selectAll("*")
                .remove();
            this.createChart();
        },
        setDimensions() {
            const container = this.$refs.chartContainer;
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
        positionTooltip(event, tooltipElement) {
            if (!tooltipElement) return;
            
            const chartRect = this.$refs.chartContainer.getBoundingClientRect();
            const tooltipRect = tooltipElement.getBoundingClientRect();
            
            const relativeX = event.clientX - chartRect.left;
            const relativeY = event.clientY - chartRect.top;
            
            let top, left;
            
            const preferredTop = relativeY - tooltipRect.height + 20;
            const preferredLeft = relativeX + 5;
            
            if (preferredTop < 0) {
                top = relativeY + 20;
            } else {
                top = preferredTop;
            }
            
            if (preferredLeft + tooltipRect.width > chartRect.width) {
                left = relativeX - tooltipRect.width - 5;
                
                if (left < 0) {
                    left = Math.max(0, relativeX - (tooltipRect.width / 2));
                }
            } else {
                left = preferredLeft;
            }
            
            tooltipElement.style.top = `${top}px`;
            tooltipElement.style.left = `${left}px`;
        },
        createChart() {
            const yearCounts = this.chartData;

            if (!yearCounts.length) {
                console.error("No data available to render the chart.");
                return;
            }

            const x = d3
                .scaleTime()
                .domain(d3.extent(yearCounts, (d) => new Date(d.Year, 0)))
                .range([0, this.width]);

            const y = d3
                .scaleLinear()
                .domain([0, d3.max(yearCounts, (d) => d.count)])
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

            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", this.width / 2)
                .attr("y", this.height + 35)
                .text("Year")
                .style("fill", "#4b5563")
                .style("font-size", "12px")
                .style("font-weight", "500");

            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("x", -this.height / 2)
                .attr("y", -60)
                .text("Resale Transactions")
                .style("fill", "#4b5563")
                .style("font-size", "12px")
                .style("font-weight", "500");

            const line = d3
                .line()
                .x((d) => x(new Date(d.Year, 0)))
                .y((d) => y(d.count));

            const filteredCounts = yearCounts.filter((d) => d.Year !== 2023);

            const path = svg
                .append("path")
                .data([filteredCounts])
                .attr("class", "line")
                .attr("d", line)
                .style("fill", "none")
                .style("stroke", "steelblue")
                .style("stroke-width", 2);

            const pathElement = path.node();

            requestAnimationFrame(() => {
                const totalLength = pathElement.getTotalLength();

                path.attr(
                    "stroke-dasharray",
                    `${totalLength} ${totalLength}`
                ).attr("stroke-dashoffset", totalLength);

                gsap.set(this.$el.querySelector(".chart-group"), {
                    opacity: 0,
                });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: this.$el,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                });

                tl.to(this.$el.querySelector(".chart-group"), {
                    opacity: 1,
                    duration: 1,
                    ease: "power1.out",
                }).to(pathElement, {
                    strokeDashoffset: 0,
                    duration: 2,
                    ease: "power2.out",
                });
            });

            const tooltip = this.$refs.tooltip;

            this.dotSelection = svg
                .selectAll(".dot")
                .data(filteredCounts)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("r", 4)
                .attr("cx", (d) => x(new Date(d.Year, 0)))
                .attr("cy", (d) => y(d.count))
                .style("fill", "red")
                .style("opacity", 0)
                .on("mouseover", (event, d) => {
                    d3.select(tooltip)
                        .style("display", "inline-block")
                        .html(
                        `Year: ${d.Year}<br>
                            Transactions: <span class="tracking-wider"><strong>${new Intl.NumberFormat().format(
                                d.count
                            )}</strong></span>`
                        );
                    
                    this.positionTooltip(event, tooltip);
                    
                    d3.select(event.target).attr("r", 6);
                })
                .on("mousemove", (event) => {
                    this.positionTooltip(event, tooltip);
                })
                .on("mouseout", (event, d) => {
                    d3.select(tooltip).style("display", "none");

                    const isHighlighted =
                        this.shouldHighlight &&
                        this.highlightYears.includes(d.Year);
                    d3.select(event.target).attr("r", isHighlighted ? 5 : 3);
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
    max-width: 600px;
    min-height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}

#line-chart-transaction {
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

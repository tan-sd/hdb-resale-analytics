<template>
    <div
        class="chart-container w-full h-full flex flex-col items-center justify-center"
    >
        <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">
            Median Income vs Resale Price
        </h3>
        <div
            id="line-chart-income-vs-price"
            ref="chartContainer"
            class="w-full h-full flex items-center justify-center"
        >
            <svg
                :viewBox="`0 0 ${width + margin.left + margin.right} ${
                    height + margin.top + margin.bottom
                }`"
                preserveAspectRatio="xMidYMid meet"
                class="w-full h-full"
            >
                <g
                    class="chart-group"
                    :transform="`translate(${margin.left},${margin.top})`"
                />
            </svg>
        </div>
        <div
            id="tooltip-income-vs-price"
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
import { watch, onMounted, onBeforeUnmount } from "vue";
import { useDataStore } from "@/stores/dataStore";
gsap.registerPlugin(ScrollTrigger);

export default {
    name: "LineChartIncomeVsPrice",
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
            margin: { top: 20, right: 80, bottom: 40, left: 80 },
            width: 0,
            height: 0,
        };
    },
    mounted() {
        this.setDimensions();
        window.addEventListener("resize", this.handleResize);

        const store = useDataStore();

        watch(
            () => [store.yearMedians, store.affordabilityIndex],
            ([yearMedians, affordability]) => {
                if (yearMedians.length && affordability.length) {
                    this.createChart(store);
                }
            },
            { immediate: true }
        );

        watch(
            () => [store.yearMedians, store.affordabilityIndex],
            ([yearMedians, affordability], _, onCleanup) => {
                if (yearMedians.length && affordability.length) {
                    this.createChart(store);
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

            const store = useDataStore();
            this.createChart(store);
        },
        setDimensions() {
            const container = this.$refs.chartContainer;
            if (container) {
                const boundingBox = container.getBoundingClientRect();
                this.width =
                    boundingBox.width - this.margin.left - this.margin.right;
                this.height =
                    (boundingBox.height > 0 ? boundingBox.height : 400) -
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

            top = preferredTop < 0 ? relativeY + 20 : preferredTop;
            if (preferredLeft + tooltipRect.width > chartRect.width) {
                left = relativeX - tooltipRect.width - 5;
                if (left < 0) {
                    left = Math.max(0, relativeX - tooltipRect.width / 2);
                }
            } else {
                left = preferredLeft;
            }

            tooltipElement.style.top = `${top}px`;
            tooltipElement.style.left = `${left}px`;
        },
        createChart(store) {
            const svg = d3.select(this.$el).select("svg").select("g");
            svg.selectAll("*").remove();

            const incomeMap = Object.fromEntries(
                store.affordabilityIndex.map((d) => [
                    d.Year,
                    d.AffordabilityIndex *
                        (store.yearMedians.find((m) => m.Year === d.Year)
                            ?.median || 0),
                ])
            );

            const combined = store.yearMedians
                .map((d) => ({
                    Year: d.Year,
                    MedianResalePrice: d.median,
                    MedianAnnualIncome: incomeMap[d.Year] || null,
                }))
                .filter((d) => d.MedianAnnualIncome && d.MedianResalePrice);

            if (!combined.length) return;

            const x = d3
                .scaleTime()
                .domain(d3.extent(combined, (d) => new Date(d.Year, 0)))
                .range([0, this.width]);

            const yLeft = d3
                .scaleLinear()
                .domain([
                    0,
                    d3.max(combined, (d) => d.MedianAnnualIncome) * 1.1,
                ])
                .range([this.height, 0]);

            const yRight = d3
                .scaleLinear()
                .domain([0, d3.max(combined, (d) => d.MedianResalePrice) * 1.1])
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

            svg.append("g")
                .attr("transform", `translate(0,${this.height})`)
                .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

            const yLeftAxis = svg.append("g").call(d3.axisLeft(yLeft).ticks(6));

            yLeftAxis
                .append("text")
                .attr("x", -this.height / 2)
                .attr("y", -this.margin.left + 15)
                .attr("transform", "rotate(-90)")
                .attr("fill", "blue")
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .text("Median Annual Income ($)");

            const yRightAxis = svg
                .append("g")
                .attr("transform", `translate(${this.width},0)`)
                .call(d3.axisRight(yRight).ticks(6));

            yRightAxis
                .append("text")
                .attr(
                    "transform",
                    `translate(60, ${this.height / 2}) rotate(90)`
                )
                .attr("fill", "green")
                .style("text-anchor", "middle")
                .style("font-size", "12px")
                .text("Median Resale Price ($)");

            const incomeLine = d3
                .line()
                .x((d) => x(new Date(d.Year, 0)))
                .y((d) => yLeft(d.MedianAnnualIncome));

            const priceLine = d3
                .line()
                .x((d) => x(new Date(d.Year, 0)))
                .y((d) => yRight(d.MedianResalePrice));

            svg.append("path")
                .datum(combined)
                .attr("fill", "none")
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("d", incomeLine);

            svg.append("path")
                .datum(combined)
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("stroke-width", 2)
                .attr("d", priceLine);

            const tooltip = this.$refs.tooltip;

            svg.selectAll(".dot-income")
                .data(combined)
                .enter()
                .append("circle")
                .attr("class", "dot dot-income")
                .attr("r", 4)
                .attr("cx", (d) => x(new Date(d.Year, 0)))
                .attr("cy", (d) => yLeft(d.MedianAnnualIncome))
                .style("fill", "blue")
                .style("opacity", 1)
                .on("mouseover", (event, d) => {
                    d3.select(tooltip)
                        .style("display", "inline-block")
                        .html(
                            `Year: ${d.Year}<br>
                        <span class="tracking-wider">Income: <strong>$${new Intl.NumberFormat().format(
                            d.MedianAnnualIncome
                        )}</strong></span>`
                        );
                    this.positionTooltip(event, tooltip);
                    d3.select(event.target).attr("r", 6);
                })
                .on("mousemove", (event) => {
                    this.positionTooltip(event, tooltip);
                })
                .on("mouseout", (event) => {
                    d3.select(tooltip).style("display", "none");
                    d3.select(event.target).attr("r", 4);
                });

            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", this.width / 2)
                .attr("y", this.height + 35)
                .text("Year")
                .style("fill", "#4b5563")
                .style("font-size", "12px")
                .style("font-weight", "500");

            // Price dots (green)
            svg.selectAll(".dot-price")
                .data(combined)
                .enter()
                .append("circle")
                .attr("class", "dot dot-price")
                .attr("r", 4)
                .attr("cx", (d) => x(new Date(d.Year, 0)))
                .attr("cy", (d) => yRight(d.MedianResalePrice))
                .style("fill", "green")
                .style("opacity", 1)
                .on("mouseover", (event, d) => {
                    d3.select(tooltip)
                        .style("display", "inline-block")
                        .html(
                            `Year: ${d.Year}<br>
                        <span class="tracking-wider">Resale Price: <strong>$${new Intl.NumberFormat().format(
                            d.MedianResalePrice
                        )}</strong></span>`
                        );
                    this.positionTooltip(event, tooltip);
                    d3.select(event.target).attr("r", 6);
                })
                .on("mousemove", (event) => {
                    this.positionTooltip(event, tooltip);
                })
                .on("mouseout", (event) => {
                    d3.select(tooltip).style("display", "none");
                    d3.select(event.target).attr("r", 4);
                });

            gsap.set(svg.node(), { opacity: 0 });
            gsap.to(svg.node(), {
                scrollTrigger: {
                    trigger: this.$el,
                    start: "top 80%",
                    toggleActions: "play none none none",
                },
                opacity: 1,
                duration: 1,
            });

            this.dotSelection = svg.selectAll(".dot");

            watch(
                () => [this.highlightYears, this.shouldHighlight],
                ([years, highlight]) => {
                    if (!this.dotSelection) return;

                    highlightRange();

                    this.dotSelection
                        .transition()
                        .duration(300)
                        .style("opacity", (d) =>
                            highlight ? (years.includes(d.Year) ? 1 : 0.4) : 1
                        )
                        .attr("r", (d) =>
                            highlight ? (years.includes(d.Year) ? 5 : 3) : 4
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
    max-width: 700px;
    min-height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}

#line-chart-income-vs-price {
    flex: 1;
    width: 100%;
    height: 100%;
    position: relative;
}
</style>

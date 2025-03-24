<template>
    <div id="chart-container">
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
            id="tooltip"
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

export default {
    name: "LineChart",
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
            dotSelection: null,
        };
    },
    mounted() {
        if (this.data.length > 0) return;

        this.setDimensions();

        window.addEventListener("resize", this.setDimensions);

        Promise.all([
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1990.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1991.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1992.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1993.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1994.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1995.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1996.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1997.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1998.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1999.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2000.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2001.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2002.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2003.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2004.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2005.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2006.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2007.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2008.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2009.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2010.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2011.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2012.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2013.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2014.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2015.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2016.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2017.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2018.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2019.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2020.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2021.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2022.csv"),
            d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2023.csv"),
        ]).then(this.createChart);
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

        createChart(data) {
            const allData = [].concat(...data);

            allData.forEach((d) => {
                d.Year = +d.Year;
                d.Month = +d.Month;
                d.ResalePrice = +d["Resale Price"];
                d.Date = new Date(d.Year, d.Month - 1);
            });

            const groupedByYear = d3.group(allData, (d) => d.Year);

            const yearMedians = Array.from(groupedByYear, ([year, values]) => {
                return {
                    Year: year,
                    median: d3.median(values, (d) => d.ResalePrice),
                };
            });

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

                    svg.insert("rect", ":first-child") // insert at back
                        .attr("class", "highlight-rect")
                        .attr("x", x(new Date(minYear, 0)))
                        .attr("y", 0)
                        .attr(
                            "width",
                            x(new Date(maxYear + 1, 0)) -
                                x(new Date(minYear, 0))
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

            const tooltip = d3.select("#tooltip");

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
                    tooltip
                        .style("display", "inline-block")
                        .html(
                            `Year: ${
                                d.Year
                            }<br>Median Price: $${d.median.toFixed(2)}`
                        );
                    d3.select(event.target).attr("r", 6);
                })
                .on("mousemove", function (event) {
                    const [mouseX, mouseY] = d3.pointer(event, this);

                    tooltip
                        .style("top", `${mouseY - 50}px`)
                        .style("left", `${mouseX + 10}px`);
                })
                .on("mouseout", (event, d) => {
                    tooltip.style("display", "none");
                    d3.select(event.target).attr("r", 5);
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
#chart-container {
    width: 100%;
    height: 100%;
    height: 400px;
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

<template>
    <div class="chart-container relative flex flex-col items-center justify-center">
      <h3 class="text-sm mb-2 text-center">Price per Sqm by Planning Area</h3>
      <div id="box-plot">
          <svg
            viewbox="0 0 1000 600"
            :width="width + margin.left + margin.right"
            :height="height + margin.top + margin.bottom">
            <g
                    :transform="
                        'translate(' + margin.left + ',' + margin.top + ')'
                    "
                />
        </svg>
      </div>
    </div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import { useDataStore } from "@/stores/dataStore";
  import { watch } from "vue";
  
  export default {
    name: "BoxPlotPricePerSqm",
    data() {
      return {
        margin: { top: 20, right: 30, bottom: 40, left: 60 },
        width: 0,
        height: 0,
      };
    },
    computed: {
        chartData() {
            const store = useDataStore();
            return store.pricePerSqmByPlanningArea || [];
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
            const container = this.$el.querySelector("#box-plot");
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
            const data = this.chartData;

            if (!data.length) {
                console.error("No data available to render the chart.");
                return;
            }

            const svg = d3.select(this.$el).select("svg").select("g");
            svg.selectAll("*").remove(); // Clear previous chart

            // Set up x and y scales
            const x = d3
                .scaleBand()
                .domain(data.map((d) => d.area))
                .range([0, this.width])
                .paddingInner(0.3)
                .paddingOuter(0.2);

            const allValues = data.flatMap((d) => d.values);
            const y = d3
                .scaleLinear()
                .domain([0, d3.quantile(allValues, 0.99)]) // Cut extreme outliers
                .range([this.height, 0]);

            // Draw axes
            svg
                .append("g")
                .attr("transform", `translate(0,${this.height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            svg.append("g").call(d3.axisLeft(y));

            // Draw box plots
            data.forEach((d) => {
                const values = d.values.sort(d3.ascending);
                const q1 = d3.quantile(values, 0.25);
                const median = d3.quantile(values, 0.5);
                const q3 = d3.quantile(values, 0.75);
                const iqr = q3 - q1;
                const min = d3.max([d3.min(values), q1 - 1.5 * iqr]);
                const max = d3.min([d3.max(values), q3 + 1.5 * iqr]);

                const cx = x(d.area);
                const boxWidth = x.bandwidth();

                const group = svg.append("g");

                // Whisker line
                group
                .append("line")
                .attr("x1", cx + boxWidth / 2)
                .attr("x2", cx + boxWidth / 2)
                .attr("y1", y(min))
                .attr("y2", y(max))
                .attr("stroke", "black");

                // Box
                group
                .append("rect")
                .attr("x", cx)
                .attr("y", y(q3))
                .attr("height", y(q1) - y(q3))
                .attr("width", boxWidth)
                .attr("stroke", "black")
                .attr("fill", "#69b3a2");

                // Median line
                group
                .append("line")
                .attr("x1", cx)
                .attr("x2", cx + boxWidth)
                .attr("y1", y(median))
                .attr("y2", y(median))
                .attr("stroke", "black");
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
  
  #box-plot {
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
  
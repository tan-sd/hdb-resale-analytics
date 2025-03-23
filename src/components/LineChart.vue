<template>
    <div id="chart-container">
        <div id="line-chart">
            <svg :width="width + margin.left + margin.right" :height="height + margin.top + margin.bottom">
                <g :transform="'translate(' + margin.left + ',' + margin.top + ')'" />
            </svg>
        </div>
        <div id="tooltip" style="position: absolute; padding: 8px; background: rgba(0,0,0,0.7); color: white; border-radius: 5px; display: none;"></div>
    </div>
</template>
  
  <script>
  import * as d3 from "d3";
  
  export default {
    name: "LineChart",
    data() {
      return {
        margin: { top: 20, right: 30, bottom: 40, left: 60 },
        width: 960,
        height: 500,
        data: []
      };
    },
    mounted() {
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
  createChart(data) {
    const allData = [].concat(...data);

    allData.forEach(d => {
      d.Year = +d.Year;
      d.Month = +d.Month;
      d.ResalePrice = +d['Resale Price'];
      d.Date = new Date(d.Year, d.Month - 1);
    });

    const groupedByYear = d3.group(allData, d => d.Year);

    const yearMedians = Array.from(groupedByYear, ([year, values]) => {
      return {
        Year: year,
        median: d3.median(values, d => d.ResalePrice)
      };
    });

    const x = d3.scaleTime()
      .domain(d3.extent(yearMedians, d => new Date(d.Year, 0)))
      .range([0, this.width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(yearMedians, d => d.median)])
      .range([this.height, 0]);

    const svg = d3.select(this.$el).select("svg").select("g");

    svg.append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    const line = d3.line()
      .x(d => x(new Date(d.Year, 0)))
      .y(d => y(d.median));

    svg.append("path")
      .data([yearMedians])
      .attr("class", "line")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", "steelblue")
      .style("stroke-width", 2);

    const tooltip = d3.select("#tooltip");

    svg.selectAll(".dot")
      .data(yearMedians)
      .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 4)
      .attr("cx", d => x(new Date(d.Year, 0)))
      .attr("cy", d => y(d.median))
      .style("fill", "red")
      .on("mouseover", (event, d) => {
        tooltip.style("display", "inline-block")
               .html(`Year: ${d.Year}<br>Median Price: $${d.median.toFixed(2)}`)
               .style("left", `${event.pageX + 10}px`)
               .style("top", `${event.pageY + 10}px`);
        d3.select(event.target).attr("r", 6);
      })
      .on("mouseout", (event, d) => {
        tooltip.style("display", "none");
        d3.select(event.target).attr("r", 4);
      });
  }
}
  }
</script>

<style scoped>
#chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

#line-chart {
  display: inline-block;
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
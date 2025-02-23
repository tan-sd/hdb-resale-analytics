<template>
    <div
        ref="chartRef"
        style="width: 100%; height: 300px; position: relative"
    ></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import * as d3 from "d3";

const chartRef = ref(null); // Reference for the chart container

onMounted(() => {
  drawChart();
  window.addEventListener("resize", drawChart); // Make it responsive
});

onUnmounted(() => {
  window.removeEventListener("resize", drawChart);
});

function drawChart() {
  // Clear any existing SVG before re-drawing (important for responsiveness)
  d3.select(chartRef.value).select("svg").remove();

  // Sample data
  const data = [10, 25, 35, 50, 75];

  // Set dynamic width and height
  const width = chartRef.value.clientWidth || 400;
  const height = 250;
  const barWidth = width / data.length - 10;

  // Create SVG
  const svg = d3
    .select(chartRef.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a tooltip
  const tooltip = d3
    .select(chartRef.value)
    .append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("visibility", "hidden")
    .style("pointer-events", "none");

  // Create a scale for the bars
  const yScale = d3.scaleLinear().domain([0, d3.max(data)]).range([height, 0]);

  // Append bars with animations
  svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * (barWidth + 10))
    .attr("y", height) // Start from bottom (animation effect)
    .attr("width", barWidth)
    .attr("height", 0) // Start with zero height for animation
    .attr("fill", "steelblue")
    .transition()
    .duration(800)
    .attr("y", d => yScale(d))
    .attr("height", d => height - yScale(d));

  // Add hover interactivity
  svg
    .selectAll("rect")
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration(200).attr("fill", "orange");
      tooltip.style("visibility", "visible").text(`Value: ${d}`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", event.pageY - 40 + "px")
        .style("left", event.pageX + 10 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).transition().duration(200).attr("fill", "steelblue");
      tooltip.style("visibility", "hidden");
    });
}
</script>

<style scoped>
div {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>

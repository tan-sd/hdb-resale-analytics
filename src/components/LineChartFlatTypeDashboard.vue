<template>
    <div class="w-full h-full">
      <svg ref="chart" class="w-full h-full"></svg>
      <div v-if="!hasData" class="flex items-center justify-center h-full text-muted-foreground text-sm">
        No data available
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
  import * as d3 from 'd3';
  
  const props = defineProps({
    data: {
      type: Array,
      required: true
    },
    areaName: {
      type: String,
      default: 'All Singapore'
    },
    year: {
      type: Number,
      default: 2023
    }
  });
  
  const chart = ref(null);
  const hasData = computed(() => props.data && props.data.length > 0);
  
  const drawChart = () => {
    if (!chart.value || !hasData.value) return;

    d3.select(chart.value).selectAll('*').remove();

    const flatTypeGroups = d3.group(props.data, d => d["Flat Type"]);
    const flatTypeData = Array.from(flatTypeGroups, ([key, value]) => ({
      type: key,
      count: value.length
    })).sort((a, b) => b.count - a.count);

    const width = chart.value.clientWidth;
    const height = chart.value.clientHeight;
    const margin = { top: 20, right: 30, bottom: 40, left: 100 };

    margin.bottom = 70;

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(chart.value)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const y = d3.scaleBand()
      .domain(flatTypeData.map(d => d.type))
      .range([0, innerHeight])
      .padding(0.2);

    const x = d3.scaleLinear()
      .domain([0, d3.max(flatTypeData, d => d.count)])
      .nice()
      .range([0, innerWidth]);

    const color = d3.scaleOrdinal()
      .domain(flatTypeData.map(d => d.type))
      .range(d3.schemeCategory10);

    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('padding', '5px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));

    svg.selectAll('.bar')
      .data(flatTypeData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.type))
      .attr('x', 0)
      .attr('height', y.bandwidth())
      .attr('width', d => x(d.count))
      .attr('fill', d => color(d.type))
      .style('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 1);
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip.html(`${d.type}: ${d.count} units (${(d.count / props.data.length * 100).toFixed(1)}%)`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.7);
        tooltip.transition().duration(500).style('opacity', 0);
      });

    svg.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + margin.bottom - 30)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Number of Units");
  };
  
  onMounted(() => {
    if (hasData.value) {
      drawChart();
    }
  });
  
  watch(() => [props.data, props.areaName, props.year], () => {
    if (hasData.value) {
      drawChart();
    }
  }, { deep: true });

  onUnmounted(() => {
    d3.select('body').selectAll('.tooltip').remove();
  });
  </script>  
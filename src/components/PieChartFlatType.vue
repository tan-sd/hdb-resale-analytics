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
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const radius = Math.min(width, height) / 2 - margin.top;
  
    const svg = d3.select(chart.value)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
  
    const color = d3.scaleOrdinal()
      .domain(flatTypeData.map(d => d.type))
      .range(d3.schemeCategory10);
  
    const pie = d3.pie()
      .value(d => d.count)
      .sort(null);
  
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);
  
    const outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);
  
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('padding', '5px')
      .style('border', '1px solid #ccc')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0);
  
    const slices = svg.selectAll('.slice')
      .data(pie(flatTypeData))
      .enter()
      .append('g')
      .attr('class', 'slice');
  
    slices.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.type))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 1);
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(`${d.data.type}: ${d.data.count} units (${(d.data.count / props.data.length * 100).toFixed(1)}%)`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.7);
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  
    const totalCount = props.data.length;
    slices.filter(d => d.data.count / totalCount > 0.05)
      .append('text')
      .attr('transform', d => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.7 * (midAngle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .attr('dy', '.35em')
      .style('text-anchor', d => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      })
      .style('font-size', '10px')
      .text(d => d.data.type);
  
    slices.filter(d => d.data.count / totalCount > 0.05)
      .append('polyline')
      .attr('points', d => {
        const pos = outerArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.7 * (midAngle < Math.PI ? 1 : -1);
        return [arc.centroid(d), outerArc.centroid(d), pos];
      })
      .style('fill', 'none')
      .style('stroke', 'gray')
      .style('stroke-width', '1px');
  
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -height / 2 + margin.top)
      .attr('class', 'text-xs font-medium')
      .text('Distribution by Flat Type');
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
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
      avgPrice: d3.mean(value, d => +d["Resale Price"]),
      count: value.length
    })).sort((a, b) => {
      const order = { "1 ROOM": 1, "2 ROOM": 2, "3 ROOM": 3, "4 ROOM": 4, "5 ROOM": 5, "EXECUTIVE": 6, "MULTI-GENERATION": 7 };
      return (order[a.type] || 99) - (order[b.type] || 99);
    });
  
    const width = chart.value.clientWidth;
    const height = chart.value.clientHeight;
    const margin = { top: 30, right: 20, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
  

    const svg = d3.select(chart.value)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
    const x = d3.scaleBand()
      .domain(flatTypeData.map(d => d.type))
      .range([0, innerWidth])
      .padding(0.2);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(flatTypeData, d => d.avgPrice) * 1.1])
      .range([innerHeight, 0]);
  
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
  
    svg.selectAll('.bar')
      .data(flatTypeData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.type))
      .attr('y', d => y(d.avgPrice))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.avgPrice))
      .attr('fill', d => color(d.type))
      .style('opacity', 0.7)
      .on('mouseover', function(event, d) {
        d3.select(this).style('opacity', 1);
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(`${d.type}<br>Avg Price: $${d3.format(",.0f")(d.avgPrice)}<br>Count: ${d.count} units`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.7);
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  
    svg.selectAll('.label')
      .data(flatTypeData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.type) + x.bandwidth() / 2)
      .attr('y', d => y(d.avgPrice) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '9px')
      .text(d => `$${d3.format(",.0f")(d.avgPrice)}`);
  
    svg.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '10px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em');
  
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d3.format(",.0f")(d)}`))
      .selectAll('text')
      .style('font-size', '10px');
  
    svg.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs font-medium')
      .text('Average Price by Flat Type');
  
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 15)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .text('Average Price (SGD)');
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
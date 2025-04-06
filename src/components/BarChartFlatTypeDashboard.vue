<template>
  <div ref="chartContainer" class="w-full h-full relative">
    <svg ref="chart" class="w-full h-full"></svg>
    <div v-if="!hasData" class="flex items-center justify-center h-full text-muted-foreground text-sm">
      No data available
    </div>
    <div ref="tooltip"
         class="absolute z-50 text-xs bg-white border border-gray-300 rounded px-2 py-1 shadow-md pointer-events-none"
         style="opacity: 0;">
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
  
  const chartContainer = ref(null);
  const chart = ref(null);
  const tooltip = ref(null);
  const hasData = computed(() => props.data && props.data.length > 0);

  const showTooltip = (event, d) => {
  if (!tooltip.value) return;
  tooltip.value.innerHTML = `${d.type}: <strong>${d.count}</strong> units`;
  tooltip.value.style.opacity = 1;
  positionTooltip(event, tooltip.value);
};

const hideTooltip = () => {
  if (tooltip.value) {
    tooltip.value.style.opacity = 0;
  }
};

const positionTooltip = (event, tooltipElement) => {
  if (!tooltipElement || !chartContainer.value) return;

  const chartRect = chartContainer.value.getBoundingClientRect();
  const tooltipRect = tooltipElement.getBoundingClientRect();

  const relativeX = event.clientX - chartRect.left;
  const relativeY = event.clientY - chartRect.top;

  let top, left;

  const preferredTop = relativeY - tooltipRect.height;
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
};
  
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

    d3.select(chart.value).selectAll('.tooltip').remove();

    const tooltip = d3.select(chart.value.parentNode)
      .append('div')
      .attr('class', 'tooltip absolute text-xs bg-white border border-gray-300 rounded px-2 py-1 shadow-md pointer-events-none')
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
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 1);
        showTooltip(event, d);
      })
      .on('mousemove', function (event, d) {
        showTooltip(event, d)
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 0.7);
        hideTooltip();
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
  if (chart.value?.parentNode) {
    d3.select(chart.value.parentNode).selectAll('.tooltip').remove();
  }
});
  </script>  
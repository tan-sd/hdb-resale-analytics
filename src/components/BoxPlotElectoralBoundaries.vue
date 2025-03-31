<template>
    <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
      <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">
        Resale Prices (2024 Adj) Within 500m of WP/SDA–PAP Boundaries
      </h3>
      <div id="box-plot" ref="chartWrapper" class="w-full relative">
        <svg ref="svg" class="w-full h-full"></svg>
      </div>
    </div>
  </template>
  
  <script>
  import * as d3 from "d3";
  import { ref, onMounted, watch, nextTick, computed } from "vue";
  import { useDataStore } from "@/stores/dataStore";
  import buffer from '@turf/buffer';
  import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
  import { point, featureCollection } from '@turf/helpers';
  import union from '@turf/union';
  
  export default {
    name: "BoxPlotElectoralBoundaries",
    setup() {
      const svg = ref(null);
      const chartWrapper = ref(null);
      const width = ref(800);
      const height = ref(500);
      const margin = { top: 20, right: 30, bottom: 90, left: 70 };
      const dataStore = useDataStore();
  
      const filteredData = computed(() => {
        const raw = dataStore.chartData ?? [];
        if (!raw.length) return [];
  
        const getPeriod = (year) => {
          if (year >= 2006 && year <= 2010) return "2006–2010";
          if (year >= 2011 && year <= 2012) return "2011–2012";
          if (year >= 2013 && year <= 2014) return "2013–2014";
          if (year >= 2015 && year <= 2019) return "2015–2019";
          if (year >= 2020 && year <= 2023) return "2020–2023";
          return "Other";
        };
  
        const df = raw.filter(d => {
          const year = +d.Year;
          return year >= 2006 && year <= 2023;
        });
  
        const wp = df.filter(d => d["Ruling Party"] === "WP");
        const sda = df.filter(d => d["Ruling Party"] === "SDA");
        const pap = df.filter(d => d["Ruling Party"] === "PAP");
  
        const oppPoints = [...wp, ...sda]
          .map(d => {
            const lat = parseFloat(d.Latitude);
            const lon = parseFloat(d.Longitude);
            if (isNaN(lat) || isNaN(lon)) return null;
            return point([lon, lat]);
          })
          .filter(Boolean);
  
        if (!oppPoints.length) return [];
  
        const bufferFC = buffer(featureCollection(oppPoints), 0.5, { units: "kilometers" });
  
        let mergedBuffer = bufferFC.features[0];
        for (let i = 1; i < bufferFC.features.length; i++) {
          const next = bufferFC.features[i];
          if (next && mergedBuffer) {
            try {
              mergedBuffer = union(mergedBuffer, next);
            } catch (e) {
              console.warn("Union failed at index", i, e);
            }
          }
        }
  
        const papNearby = pap.filter(d => {
          const lat = parseFloat(d.Latitude);
          const lon = parseFloat(d.Longitude);
          if (isNaN(lat) || isNaN(lon)) return false;
          return booleanPointInPolygon(point([lon, lat]), mergedBuffer);
        });
  
        const borderFlats = [
          ...wp.map(f => ({ ...f, Zone: "WP" })),
          ...sda.map(f => ({ ...f, Zone: "SDA" })),
          ...papNearby.map(f => ({ ...f, Zone: "PAP" })),
        ];
  
        const grouped = d3.group(borderFlats, d => getPeriod(+d.Year), d => d.Zone);
  
        return Array.from(grouped, ([period, byZone]) => {
          return Array.from(byZone, ([zone, records]) => {
            const values = records.map(d => parseFloat(d["Resale Price Adj 2024"])).filter(v => !isNaN(v));
            return {
              period,
              zone,
              values
            };
          });
        }).flat();
      });
  
      const resizeAndRedraw = () => {
        setDimensions();
        drawChart(filteredData.value || []);
      };
  
      const setDimensions = () => {
        if (!chartWrapper.value) return;
        const widthAvailable = chartWrapper.value.clientWidth;
        if (widthAvailable === 0) return;
        width.value = widthAvailable - margin.left - margin.right;
        height.value = 500;
      };
  
      const drawChart = (data) => {
        const processedData = data.map((d) => {
          const values = [...d.values].sort(d3.ascending);
          const q1 = d3.quantile(values, 0.25);
          const median = d3.quantile(values, 0.5);
          const q3 = d3.quantile(values, 0.75);
          const iqr = q3 - q1;
          const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
          const max = Math.min(d3.max(values), q3 + 1.5 * iqr);
          return { ...d, q1, median, q3, iqr, min, max };
        });
  
        const svgEl = d3.select(svg.value);
        svgEl.selectAll("*").remove();
  
        const totalWidth = width.value + margin.left + margin.right;
        const totalHeight = height.value + margin.top + margin.bottom;
        const g = svgEl
          .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
          .append("g")
          .attr("transform", `translate(${margin.left},${margin.top})`);
  
        const zoneOrder = ["PAP", "WP", "SDA"];
        processedData.sort((a, b) => {
          if (a.period !== b.period) return a.period.localeCompare(b.period);
          return zoneOrder.indexOf(a.zone) - zoneOrder.indexOf(b.zone);
        });
  
        const periods = Array.from(new Set(processedData.map(d => d.period)));
        const zones = ["PAP", "WP", "SDA"];

        const x0 = d3.scaleBand()
        .domain(periods)
        .range([0, width.value])
        .paddingInner(0.1)
        .paddingOuter(0.2);

        const x1 = d3.scaleBand()
        .domain(zones)
        .range([0, x0.bandwidth()])
        .padding(0.05);
  
        const allValues = processedData.flatMap(d => d.values);
        const y = d3.scaleLinear()
          .domain([0, d3.quantile(allValues, 0.99)])
          .range([height.value, 0])
          .nice();
  
        g.append("g")
          .attr("class", "x-axis")
          .attr("transform", `translate(0,${height.value})`)
          .call(d3.axisBottom(x0))
          .selectAll("text")
          .attr("transform", "rotate(-45)")
          .style("text-anchor", "end")
          .style("font-size", "10px");
  
        g.append("g")
          .call(d3.axisLeft(y))
          .selectAll("text")
          .style("font-size", "10px");
        
          const legendColors = {
            PAP: "#60a5fa",
            WP: "#f87171",
            SDA: "#facc15"
          };

            const legend = svgEl.append("g")
            .attr("transform", `translate(${width.value - 120}, ${margin.top})`);

            const legendEntries = Object.entries(legendColors);

            legend.selectAll("rect")
            .data(legendEntries)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (_, i) => i * 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", ([_, color]) => color);

            legend.selectAll("text")
            .data(legendEntries)
            .enter()
            .append("text")
            .attr("x", 18)
            .attr("y", (_, i) => i * 20 + 10)
            .text(([zone]) => zone)
            .style("font-size", "11px")
            .attr("alignment-baseline", "middle");
  
        svgEl.append("text")
          .attr("text-anchor", "middle")
          .attr("x", margin.left + width.value / 2)
          .attr("y", totalHeight - 5)
          .style("fill", "#4b5563")
          .style("font-size", "12px")
          .style("font-weight", "500")
          .text("Electoral Period");
  
        svgEl.append("text")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("x", -margin.top - height.value / 2)
          .attr("y", 15)
          .style("fill", "#4b5563")
          .style("font-size", "12px")
          .style("font-weight", "500")
          .text("Resale Price (2024 Adj)");
  
        const boxGroups = g.selectAll(".box-group")
          .data(processedData)
          .enter()
          .append("g")
          .attr("class", "box-group")
          .attr("transform", d => `translate(${x0(d.period) + x1(d.zone)}, 0)`)
  
        boxGroups.append("line")
          .attr("x1", x1.bandwidth() / 2)
          .attr("x2", x1.bandwidth() / 2)
          .attr("y1", d => y(d.min))
          .attr("y2", d => y(d.max))
          .attr("stroke", "black");
  
        boxGroups.append("rect")
          .attr("y", d => y(d.q3))
          .attr("height", d => y(d.q1) - y(d.q3))
          .attr("width", x1.bandwidth())
          .attr("stroke", "black")
          .attr("fill", d => d.zone === 'PAP' ? '#60a5fa' : d.zone === 'WP' ? '#f87171' : '#facc15');
  
        boxGroups.append("line")
          .attr("x1", 0)
          .attr("x2", x1.bandwidth())
          .attr("y1", d => y(d.median))
          .attr("y2", d => y(d.median))
          .attr("stroke", "black");
      };
  
      onMounted(async () => {
        await nextTick();
        requestAnimationFrame(() => {
          setDimensions();
          drawChart(filteredData.value || []);
        });
  
        window.addEventListener("resize", () => {
          setDimensions();
          drawChart(filteredData.value || []);
        });
  
        watch(
          () => dataStore.isDataReady,
          (ready) => {
            if (ready) {
              requestAnimationFrame(() => {
                setDimensions();
                drawChart(filteredData.value || []);
              });
            }
          },
          { immediate: true }
        );
      });
  
      return {
        svg,
        chartWrapper,
        resizeAndRedraw
      };
    }
  };
  </script>
  
  <style scoped>
  .chart-container {
    width: 100%;
    height: auto;
  }
  
  #box-plot {
    width: 100%;
    height: 100%;
    position: relative;
  }
  </style>
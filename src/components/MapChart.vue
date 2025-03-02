<template>
    <div class="map-container">
        <svg ref="map" :width="width" :height="height"></svg>
        <div ref="tooltip" class="tooltip"></div>
    </div>
</template>

<script setup>
    import * as d3 from "d3";
    import { ref, onMounted } from "vue";

    const width = 800;
    const height = 600;
    const map = ref(null);
    const tooltip = ref(null);

    onMounted(async () => {
        const planningArea = await d3.json("/data/master_plan/MasterPlan2019SubzoneBoundaryNoSeaGEOJSON.geojson");

        console.log(planningArea);

        const svg = d3.select(map.value);

        const projection = d3.geoMercator()
            .center([103.8198, 1.3521])
            .scale(85000)
            .translate([width / 2, height / 2]);
        
        const path = d3.geoPath().projection(projection);

        svg.selectAll("path")
            .data(planningArea.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "lightgrey")
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .on("mouseover", function (event, d) {
            d3.select(this)
                .attr("fill", "orange")
                .attr("stroke-width", 2);

            d3.select(tooltip.value)
                .style("visibility", "visible")
                .html(`${d.properties.Description}`);
            })
            .on("mousemove", function (event) {
                d3.select(tooltip.value)
                    .style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("fill", "lightgrey")
                    .attr("stroke-width", 0.5);

                d3.select(tooltip.value).style("visibility", "hidden");
            });
    });
</script>

<style scoped>
    .map-container {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .tooltip {
        position: absolute;
        visibility: hidden;
        background: white;
        padding: 5px;
        border: 1px solid black;
        border-radius: 5px;
        pointer-events: none;
    }
</style>
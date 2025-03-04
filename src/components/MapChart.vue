<template>
    <div class="map-container">
        <svg ref="map" :width="width" :height="height"></svg>
        <div ref="tooltip" class="tooltip"></div>
        <button @click="resetZoom" class="reset-zoom">Reset Map</button>
    </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import * as turf from "@turf/turf";

const width = 800;
const height = 600;
const map = ref(null);
const tooltip = ref(null);

const partyColors = {
    PAP: "#1A56A3",   // PAP (People's Action Party) - Blue
    WP: "#D00000",     // WP (Workers' Party) - Red
    RP: "#FFD700",     // RP (Reform Party) - Green
    SPP: "#E74C3C",    // SPP (Singapore People's Party) - Yellow
    SDP: "#B22222",    // SDP (Singapore Democratic Party) - Black
    PSP: "#D32F2F",    // PSP (Progress Singapore Party) - Green
    PV: "#D8D8D8",     // PV (Progressive Alliance) - Grey
    RDU: "#9B59B6",    // RDU (Reform Democrats United) - Purple
    PPP: "#FF6F61",    // PPP (People's Power Party) - Coral
    SDA: "#1565C0",    // SDA (Singapore Democratic Alliance) - Light Pink
    INDP: "#A3B0C1",   // INDP (Independent) - Light Grey
    NSP: "#F39C12",    // NSP (National Solidarity Party) - Orange
};

const resetZoom = () => {
    const svg = d3.select(map.value);
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
            svg.select("g").attr("transform", event.transform);
        });

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
};

onMounted(async () => {
    const planningArea = await d3.json("/data/master_plan/MasterPlan2019PlanningAreaBoundaryNoSea.geojson");
    const electoralBoundary2020 = await d3.json("/data/electoral_boundary/ElectoralBoundary2020GEOJSON.geojson");
    const electionResult = await d3.csv("/data/election_result/ParliamentaryGeneralElectionResultsbyCandidate.csv");
    const hawkerCentres = await d3.json("/data/point_of_interest/HawkerCentresGEOJSON.geojson");

    // Filter election results for 2020
    const election2020 = electionResult.filter(d => d.year === "2020");

    // Create a mapping of constituencies to the winning party
    const constituencyToParty = {};
    election2020.forEach((entry) => {
        const { constituency, party, vote_count, vote_percentage } = entry;
        if (!constituencyToParty[constituency]) {
            constituencyToParty[constituency.toUpperCase()] = { party, vote_count, vote_percentage };
        } else {
            // If a party has a higher vote percentage, consider them the winner
            if (parseFloat(entry.vote_percentage) > parseFloat(constituencyToParty[constituency].vote_percentage)) {
                constituencyToParty[constituency] = { party, vote_count, vote_percentage };
            }
        }
    });

    electoralBoundary2020.features.forEach((feature) => {
        const constituencyName = feature.properties.Name;
        const winningParty = constituencyToParty[constituencyName] ? constituencyToParty[constituencyName].party : "Unknown";
        const fillColor = partyColors[winningParty] || "grey";
        feature.properties.party = winningParty;
        feature.properties.color = fillColor;
        feature.geometry = turf.rewind(feature.geometry, { reverse: true });
    });

    const svg = d3.select(map.value);
    const mapGroup = svg.append("g");

    // Define projection and path
    const projection = d3.geoMercator()
        .center([103.8198, 1.3521])
        .scale(85000)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Boundaries
    mapGroup.selectAll("boundaries")
        .data(electoralBoundary2020.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => d.properties.color)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .style("pointer-events", "visible")
        .on("mouseover", function (event, d) {
            d3.select(this)
                .attr("stroke-width", 2)
                .style("cursor", "pointer");

            d3.select(tooltip.value)
                .style("visibility", "visible")
                .html(`<div id="constituency-name">${d.properties.Name
                    .toLowerCase()
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
                    .replace(/\b(\w+)-(\w+)\b/g, (match, p1, p2) => `${p1}-${p2.charAt(0).toUpperCase()}${p2.slice(1)}`)} GRC</div>
                    <div id="party">
                        <img id="party-logo" src="/img/${d.properties.party}.png"/>
                        ${d.properties.party}
                        </div>
                    `);
        })
        .on("mousemove", function (event) {
            d3.select(tooltip.value)
                .style("top", `${event.pageY - 10}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("fill", d => d.properties.color)
                .attr("stroke-width", 0.5);

            d3.select(tooltip.value).style("visibility", "hidden");
        })
        .on("click", function (event, d) {
            zoomToBoundary(d);
        });

    // Hawker Centres
    mapGroup.selectAll("hawker")
        .data(hawkerCentres.features)
        .enter()
        .append("circle")
        .attr("class", "hawker")
        .attr("cx", d => projection(d.geometry.coordinates)[0])
        .attr("cy", d => projection(d.geometry.coordinates)[1])
        .attr("r", 2.5)
        .attr("fill", "red")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .on("mouseover", function (event, d) {
            const description = d.properties.Description;
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(description, "text/html");

            const getValueFromTable = (label) => {
                const thElements = htmlDoc.querySelectorAll("th");
                for (const th of thElements) {
                    if (th.textContent.trim() === label) {
                        const td = th.nextElementSibling;
                        if (td && td.tagName === "TD") {
                            return td.textContent.trim();
                        }
                    }
                }
                return null;
            };

            const name = getValueFromTable("NAME") || getValueFromTable("ADDRESSBUILDINGNAME") || "Name not available";

            d3.select(tooltip.value)
                .style("visibility", "visible")
                .html(`${name}`);
        })
        .on("mousemove", function (event) {
            d3.select(tooltip.value)
                .style("top", `${event.pageY - 10}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
            d3.select(tooltip.value).style("visibility", "hidden");
        });

    // Zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
            mapGroup.attr("transform", event.transform);
        });

    svg.call(zoom);

    function zoomToBoundary(boundary) {
        const bounds = path.bounds(boundary);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const centerX = (bounds[0][0] + bounds[1][0]) / 2;
        const centerY = (bounds[0][1] + bounds[1][1]) / 2;
        const scale = 0.9 / Math.max(dx / width, dy / height);
        const translateX = width / 2 - scale * centerX;
        const translateY = height / 2 - scale * centerY;

        svg.transition()
            .duration(750)
            .call(
                zoom.transform,
                d3.zoomIdentity.translate(translateX, translateY).scale(scale)
            );
    }
});
</script>
<template>
    <div class="map-container">
        <div class="year-controls">
            <button @click="switchYear(2006)">2006</button>
            <button @click="switchYear(2011)">2011</button>
            <button @click="switchYear(2015)">2015</button>
            <button @click="switchYear(2020)">2020</button>
        </div>
        <div class="map-wrapper">
            <svg ref="map" :width="width" :height="height"></svg>
            <div class="poi-controls">
                <label>
                    <input type="checkbox" v-model="showHawkerCentres" /> Hawker Centres
                </label>
                <label>
                    <input type="checkbox" v-model="showGyms" /> Gyms
                </label>
                <label>
                    <input type="checkbox" v-model="showParks" /> Parks
                </label>
                <label>
                    <input type="checkbox" v-model="showMrts" /> MRT Stations
                </label>
                <label>
                    <input type="checkbox" v-model="showPreschools" /> Preschools
                </label>
            </div>
        </div>
        <div ref="tooltip" class="tooltip"></div>
        <button @click="resetZoom" class="reset-zoom">Reset Map</button>
    </div>
</template>
  
  <script setup>
  import * as d3 from "d3";
  import { ref, onMounted, watch } from "vue";
  import * as turf from "@turf/turf";
  
  const width = 800;
  const height = 600;
  const map = ref(null);
  const tooltip = ref(null);
  
  const showHawkerCentres = ref(false);
  const showGyms = ref(false);
  const showParks = ref(false);
  const showMrts = ref(false);
  const showPreschools = ref(false);
  
  const currentYear = ref(2020);
  const electoralBoundaries = ref({});
  const electionResults = ref({});
  const hawkerCentres = ref(null);
  const gyms = ref(null);
  const parks = ref(null);
  const mrts = ref(null);
  const preschools = ref(null);
  
  const partyColors = {
    PAP: "#1A56A3",
    WP: "#D00000",
    RP: "#FFD700",
    SPP: "#E74C3C",
    SDP: "#B22222",
    PSP: "#D32F2F",
    PV: "#D8D8D8",
    RDU: "#9B59B6",
    PPP: "#FF6F61",
    SDA: "#FFC107",
    INDP: "#A3B0C1",
    NSP: "#F39C12",
  };
  
  const switchYear = (year) => {
    currentYear.value = year;
  };
  
  const loadData = async () => {
    electionResults.value = await d3.csv(
      "/data/election_result/ParliamentaryGeneralElectionResultsbyCandidate.csv"
    );
    hawkerCentres.value = await d3.json(
      "/data/point_of_interest/HawkerCentresGEOJSON.geojson"
    );
    gyms.value = await d3.json("/data/point_of_interest/GymsSGGEOJSON.geojson");
    parks.value = await d3.json("/data/point_of_interest/Parks.geojson");
    mrts.value = await d3.json(
      "/data/point_of_interest/MasterPlan2003MRTName.geojson"
    );
    preschools.value = await d3.json(
      "/data/point_of_interest/PreSchoolsLocation.geojson"
    );
  
    electoralBoundaries.value = {
      2006: await d3.json(
        "/data/electoral_boundary/ElectoralBoundary2006GEOJSON.geojson"
      ),
      2011: await d3.json(
        "/data/electoral_boundary/ElectoralBoundary2011GEOJSON.geojson"
      ),
      2015: await d3.json(
        "/data/electoral_boundary/ElectoralBoundary2015GEOJSON.geojson"
      ),
      2020: await d3.json(
        "/data/electoral_boundary/ElectoralBoundary2020GEOJSON.geojson"
      ),
    };
  };
  
  const resetZoom = () => {
    const svg = d3.select(map.value);
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        svg.select("g").attr("transform", event.transform);
      });
  
    svg
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  };

  let path;
  let projection;
  
  onMounted(async () => {
    await loadData();
    drawMap();
    updatePOIs(d3.select(map.value).select("g"));
  
    const svg = d3.select(map.value);
    const mapGroup = svg.append("g");
  
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        mapGroup.attr("transform", event.transform);
      });
  
    svg.call(zoom);
  });
  
  const drawMap = () => {
    if (
      !map.value ||
      !electoralBoundaries.value[currentYear.value] ||
      !electionResults.value
    )
      return;
  
    const svg = d3.select(map.value);
    svg.selectAll("g").remove();
  
    const mapGroup = svg.append("g");
  
    projection = d3
      .geoMercator()
      .center([103.8198, 1.3521])
      .scale(85000)
      .translate([width / 2, height / 2]);
  
    path = d3.geoPath().projection(projection);
  
    const electoralYear = electoralBoundaries.value[currentYear.value];
    const electionYearResults = electionResults.value.filter(
      (d) => d.year === String(currentYear.value)
    );
  
    const constituencyToParty = {};
    electionYearResults.forEach((entry) => {
      const { constituency, party, vote_count, vote_percentage } = entry;
      const upperConstituency = constituency.toUpperCase();
      if (!constituencyToParty[upperConstituency]) {
        constituencyToParty[upperConstituency] = {
          party,
          vote_count,
          vote_percentage,
        };
      } else if (
          parseFloat(entry.vote_percentage) >
          parseFloat(constituencyToParty[upperConstituency].vote_percentage)
        ) {
          constituencyToParty[upperConstituency] = {
            party,
            vote_count,
            vote_percentage,
          };
        }
    });
  
    if (electoralYear && electoralYear.features) {
      electoralYear.features.forEach((feature) => {
        let constituencyName;

        if (currentYear.value === 2020) {
            constituencyName = feature.properties.Name.toUpperCase();
        } else {
            const description = feature.properties.Description;
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(description, "text/html");
            const edDescTd = Array.from(htmlDoc.querySelectorAll("td")).find(td => {
                const prevTh = td.previousElementSibling;
                return prevTh && prevTh.textContent.trim() === "ED_DESC";
            });

            if (edDescTd) {
                constituencyName = edDescTd.textContent
                    .trim()
                    .replace(/\s*-\s*/g, "-");
            } else {
                constituencyName = "UNKNOWN";
            }
        }

        const winningParty = constituencyToParty[constituencyName]
          ? constituencyToParty[constituencyName].party
          : "Unknown";
        const fillColor = partyColors[winningParty] || "grey";
        feature.properties.party = winningParty;
        feature.properties.color = fillColor;
        feature.geometry = turf.rewind(feature.geometry, { reverse: true });
      });
  
      mapGroup
        .selectAll("boundaries")
        .data(electoralYear.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", (d) => d.properties.color)
        .attr("stroke", "black")
        .attr("stroke-width", 0.5)
        .style("pointer-events", "visible")
        .on("mouseover", function (event, d) {
            d3.select(this)
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer");

            let constituencyName;

            if (currentYear.value === 2020) {
                constituencyName = d.properties.Name;
            } else {
                const description = d.properties.Description;
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(description, "text/html");
                const edDescTd = Array.from(htmlDoc.querySelectorAll("td")).find(td => {
                    const prevTh = td.previousElementSibling;
                    return prevTh && prevTh.textContent.trim() === "ED_DESC";
                });

                if (edDescTd) {
                    constituencyName = edDescTd.textContent;
                } else {
                    constituencyName = "UNKNOWN";
                }
            }
        
            d3.select(tooltip.value)
                .style("visibility", "visible")
                .html(
                `<div id="constituency-name">${constituencyName
                    .toLowerCase()
                    .split(" ")
                    .map(
                    (word) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ")
                .replace(
                    /\b(\w+)-(\w+)\b/g,
                    (match, p1, p2) =>
                    `${p1}\-${p2.charAt(0).toUpperCase()}${p2.slice(1)}`
                )} GRC</div>
                        <div id="party">
                            <img id="party-logo" src="/img/${
                            d.properties.party
                            }.png"/>
                            ${d.properties.party}
                        </div>
                    `
            );
        })
        .on("mousemove", function (event) {
            d3.select(tooltip.value)
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("stroke-width", 0.5);
            d3.select(tooltip.value).style("visibility", "hidden");
        })
        .on("click", function (event, d) {
            zoomToBoundary(d);
        });
  }

  updatePOIs(mapGroup, projection);
};

function updatePOIs(mapGroup) {
  mapGroup.selectAll(".poi").remove();

  if (showHawkerCentres.value && hawkerCentres.value && hawkerCentres.value.features) {
    mapGroup
      .selectAll(".hawker")
      .data(hawkerCentres.value.features)
      .enter()
      .append("circle")
      .attr("class", "poi hawker")
      .attr("cx", (d) => projection(d.geometry.coordinates)[0])
      .attr("cy", (d) => projection(d.geometry.coordinates)[1])
      .attr("r", 2.5)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("fill", "red")
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

        const name =
          getValueFromTable("NAME") ||
          getValueFromTable("ADDRESSBUILDINGNAME") ||
          "Name not available";

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
  }

  if (showGyms.value && gyms.value && gyms.value.features) {
    mapGroup
      .selectAll(".gym")
      .data(gyms.value.features)
      .enter()
      .append("circle")
      .attr("class", "poi gym")
      .attr("cx", (d) => projection(d.geometry.coordinates)[0])
      .attr("cy", (d) => projection(d.geometry.coordinates)[1])
      .attr("r", 2.5)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("fill", "blue")
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

        const name =
          getValueFromTable("NAME") ||
          getValueFromTable("ADDRESSBUILDINGNAME") ||
          "Name not available";

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
  }

  if (showParks.value && parks.value && parks.value.features) {
    mapGroup
      .selectAll(".park")
      .data(parks.value.features)
      .enter()
      .append("circle")
      .attr("class", "poi park")
      .attr("cx", (d) => projection(d.geometry.coordinates)[0])
      .attr("cy", (d) => projection(d.geometry.coordinates)[1])
      .attr("r", 2.5)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("fill", "green")
      .on("mouseover", function (event, d) {
        const name =
          d.properties.NAME
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ") || "Name not available";

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
  }

  if (showMrts.value && mrts.value && mrts.value.features) {
    mapGroup
      .selectAll(".mrt")
      .data(mrts.value.features)
      .enter()
      .append("circle")
      .attr("class", "poi mrt")
      .attr("cx", (d) => projection(d.geometry.coordinates)[0])
      .attr("cy", (d) => projection(d.geometry.coordinates)[1])
      .attr("r", 2.5)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("fill", "purple")
      .on("mouseover", function (event, d) {
        const name =
          d.properties.Name
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ") + " MRT" || "Name not available";

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
  }

  if (showPreschools.value && preschools.value && preschools.value.features) {
    mapGroup
      .selectAll(".preschool")
      .data(preschools.value.features)
      .enter()
      .append("circle")
      .attr("class", "poi preschool")
      .attr("cx", (d) => projection(d.geometry.coordinates)[0])
      .attr("cy", (d) => projection(d.geometry.coordinates)[1])
      .attr("r", 2.5)
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("fill", "orange")
      .on("mouseover", function (event, d) {
        const getValueFromTable = (label) => {
          const description = d.properties.Description;
          const parser = new DOMParser();
          const htmlDoc = parser.parseFromString(description, "text/html");
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

        const name = getValueFromTable("CENTRE_NAME") || "Name not available";

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
  }
}

watch(
  [showHawkerCentres, showGyms, showParks, showMrts, showPreschools],
  () => {
    updatePOIs(d3.select(map.value).select("g"));
  },
  { deep: true }
);

watch(currentYear, () => {
    drawMap();
});

function zoomToBoundary(boundary) {
  const bounds = path.bounds(boundary);
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const centerX = (bounds[0][0] + bounds[1][0]) / 2;
  const centerY = (bounds[0][1] + bounds[1][1]) / 2;
  const scale = 0.9 / Math.max(dx / width, dy / height);
  const translateX = width / 2 - scale * centerX;
  const translateY = height / 2 - scale * centerY;

  const svg = d3.select(map.value);
  const zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", (event) => {
      svg.select("g").attr("transform", event.transform);
    });

  svg
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(scale)
    );
}
</script>
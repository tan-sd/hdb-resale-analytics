<template>
    <div class="map-container w-full h-full">
        <div ref="tooltip" class="tooltip"></div>
        <div class="map-wrapper relative w-full h-full">
            <svg
                ref="map"
                :width="width"
                :height="height"
                class="w-full h-full"
            ></svg>

            <div
                class="absolute top-4 right-4 flex items-end gap-2 flex-col z-10"
            >
                <div
                    class="w-full flex flex-col items-start px-4 py-2 rounded-md shadow-lg text-xs bg-white border-none"
                >
                    <div class="text-xs font-medium flex items-center gap-2">
                        <Calendar :size="16" /> Year {{ selectedYear }}
                    </div>
                    <Slider
                        :model-value="[selectedYear]"
                        :min="2006"
                        :max="2020"
                        :step="1"
                        class="w-full mt-2 mb-2"
                        @update:modelValue="updateYear"
                    />
                </div>
                <Select v-model="selectedMode">
                    <SelectTrigger
                        class="px-4 py-2 rounded-md shadow-lg text-xs bg-white border-none"
                    >
                        <Layers :size="16" />
                        <SelectValue class="p-2 font-medium" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem class="text-xs" value="electoral"
                                >Electoral Boundary</SelectItem
                            >
                            <SelectItem class="text-xs" value="planning"
                                >Median Resale Price</SelectItem
                            >
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Drawer>
                    <DrawerTrigger as-child>
                        <Button
                            variant="outline"
                            class="px-4 py-2 rounded-md shadow-lg text-xs"
                        >
                            <Funnel /> Filters
                        </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                        <div class="mx-auto w-full max-w-sm">
                            <DrawerHeader>
                                <DrawerTitle> Point of Interests </DrawerTitle>
                                <DrawerDescription>
                                    Select locations to display
                                </DrawerDescription>
                            </DrawerHeader>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="flex items-center space-x-2">
                                    <Checkbox
                                        v-model="showHawkerCentres"
                                        id="hawker-centres"
                                    />
                                    <label
                                        for="hawker-centres"
                                        class="text-sm font-medium"
                                        >Hawker Centres</label
                                    >
                                </div>

                                <div class="flex items-center space-x-2">
                                    <Checkbox v-model="showGyms" id="gyms" />
                                    <label
                                        for="gyms"
                                        class="text-sm font-medium"
                                        >Gyms</label
                                    >
                                </div>

                                <div class="flex items-center space-x-2">
                                    <Checkbox v-model="showParks" id="parks" />
                                    <label
                                        for="parks"
                                        class="text-sm font-medium"
                                        >Parks</label
                                    >
                                </div>

                                <div class="flex items-center space-x-2">
                                    <Checkbox v-model="showMrts" id="mrts" />
                                    <label
                                        for="mrts"
                                        class="text-sm font-medium"
                                        >MRT Stations</label
                                    >
                                </div>

                                <div class="flex items-center space-x-2">
                                    <Checkbox
                                        v-model="showPreschools"
                                        id="preschools"
                                    />
                                    <label
                                        for="preschools"
                                        class="text-sm font-medium"
                                        >Preschools</label
                                    >
                                </div>

                                <div class="flex items-center space-x-2">
                                    <Checkbox
                                        v-model="showPrimarySchools"
                                        id="primary-schools"
                                    />
                                    <label
                                        for="primary-schools"
                                        class="text-sm font-medium"
                                        >Primary Schools</label
                                    >
                                </div>

                                <div class="flex items-center space-x-2">
                                    <Checkbox
                                        v-model="showSecondarySchools"
                                        id="secondary-schools"
                                    />
                                    <label
                                        for="secondary-schools"
                                        class="text-sm font-medium"
                                        >Secondary Schools</label
                                    >
                                </div>

                                <div class="flex items-center space-x-2">
                                    <Checkbox
                                        v-model="showJuniorColleges"
                                        id="junior-colleges"
                                    />
                                    <label
                                        for="junior-colleges"
                                        class="text-sm font-medium"
                                        >Junior Colleges</label
                                    >
                                </div>

                                <div class="flex items-center space-x-2">
                                    <Checkbox
                                        v-model="showPolytechnics"
                                        id="polytechnics"
                                    />
                                    <label
                                        for="polytechnics"
                                        class="text-sm font-medium"
                                        >Polytechnics</label
                                    >
                                </div>

                                <div class="flex items-center space-x-2">
                                    <Checkbox
                                        v-model="showUniversities"
                                        id="universities"
                                    />
                                    <label
                                        for="universities"
                                        class="text-sm font-medium"
                                        >Universities</label
                                    >
                                </div>
                            </div>
                            <DrawerFooter>
                                <DrawerClose as-child>
                                    <Button
                                        class="w-full text-white px-4 py-2 rounded-md"
                                    >
                                        Close
                                    </Button>
                                </DrawerClose>
                            </DrawerFooter>
                        </div>
                    </DrawerContent>
                </Drawer>
            </div>

            <div class="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button
                    v-if="isMapMoved"
                    @click="resetZoom"
                    variant="outline"
                    class="px-4 py-2 rounded-md shadow-lg text-xs w-28 ml-auto"
                    ><ZoomOut /> Reset map</Button
                >

                <div
                    ref="legend"
                    class="bg-white p-3 rounded-md shadow-lg text-xs"
                ></div>
            </div>

            <div
                class="absolute top-4 left-4 w-80 bg-white rounded-md shadow-lg px-3 py-2 text-sm z-20 flex flex-col"
            >
                <div class="relative w-full max-w-sm">
                    <div class="flex items-center gap-1">
                        <div class="relative flex-1">
                            <Combobox
                                v-model="selectedArea"
                                @update:modelValue="handleSelection"
                                by="label"
                            >
                                <ComboboxAnchor class="w-full">
                                    <div
                                        class="relative w-full max-w-sm items-center"
                                    >
                                        <ComboboxInput
                                            class="pr-10 text-xs h-11"
                                            :display-value="
                                                (val) => val?.label ?? ''
                                            "
                                            placeholder="Search town"
                                            v-model="searchQuery"
                                            @blur="handleBlur"
                                        />
                                        <Button
                                            variant="ghost"
                                            class="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 aspect-square rounded-full flex items-center justify-center border border-muted-foreground p-1"
                                            @click="clearSearch"
                                            v-if="searchQuery"
                                        >
                                            <X
                                                class="w-full h-full text-muted-foreground"
                                            />
                                        </Button>
                                        <span
                                            v-else
                                            class="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center border border-muted-foreground"
                                        >
                                            <Search
                                                class="w-4 h-4 text-muted-foreground"
                                            />
                                        </span>
                                    </div>
                                </ComboboxAnchor>

                                <ComboboxList
                                    class="w-[300px] max-h-48 overflow-y-auto"
                                >
                                    <ComboboxEmpty class="text-xs">
                                        No town found
                                    </ComboboxEmpty>

                                    <ComboboxGroup>
                                        <ComboboxItem
                                            v-for="area in planningAreaOptions"
                                            :key="area.value"
                                            :value="area"
                                            class="text-xs"
                                        >
                                            {{ area.label }}

                                            <!-- <ComboboxItemIndicator>
                                                <Check
                                                    class="ml-auto h-4 w-4"
                                                />
                                            </ComboboxItemIndicator> -->
                                        </ComboboxItem>
                                    </ComboboxGroup>
                                </ComboboxList>
                            </Combobox>
                        </div>
                    </div>
                </div>
                <div
                    id="histogram"
                    :class="selectedAreaInfo ? 'mt-4' : ''"
                ></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, onMounted, watch, onUnmounted, nextTick, computed } from "vue";
import * as turf from "@turf/turf";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
    Combobox,
    ComboboxAnchor,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxItemIndicator,
    ComboboxList,
} from "@/components/ui/combobox";
import { Funnel, ZoomOut, Layers, Calendar, Search, X } from "lucide-vue-next";

const SCALE_FACTOR = 155;

const width = ref(0);
const height = ref(0);
const map = ref(null);
const tooltip = ref(null);
const zoomInstance = ref(null);
const isMapMoved = ref(false);
const legend = ref(null);
const selectedAreaInfo = ref(null);
const selectedFeature = ref(null);
const searchQuery = ref("");
const hoveredAreaName = ref(null);
const selectedArea = ref(null);
const tooltipLocked = ref(false);

const showHawkerCentres = ref(false);
const showGyms = ref(false);
const showParks = ref(false);
const showMrts = ref(false);
const showPreschools = ref(false);
const showPrimarySchools = ref(false);
const showSecondarySchools = ref(false);
const showJuniorColleges = ref(false);
const showPolytechnics = ref(false);
const showUniversities = ref(false);

const selectedYear = ref(2020);
const currentYear = ref(2020);
const selectedMode = ref("electoral");
const electoralBoundaries = ref({});
const planningAreas = ref({});
const electionResults = ref({});
const hawkerCentres = ref(null);
const gyms = ref(null);
const parks = ref(null);
const mrts = ref(null);
const preschools = ref(null);
const primarySchools = ref(null);
const secondarySchools = ref(null);
const juniorColleges = ref(null);
const polytechnics = ref(null);
const universities = ref(null);
const resaleHDBs = ref(null);

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

const selectedAreaName = computed(() => selectedAreaInfo.value?.name ?? null);

let path;
let projection;
let resizeObserver = null;
let mapGroup = null;

function handleSelection(area) {
    if (area) {
        searchQuery.value = area.label;
        selectedArea.value = area;
    } else {
        searchQuery.value = "";
        selectedArea.value = null;
    }
}

function handleBlur() {
    const match = planningAreaOptions.value.find(
        (area) => area.label.toLowerCase() === searchQuery.value.toLowerCase()
    );

    if (match) {
        selectedArea.value = match;
    } else {
        selectedArea.value = null;
        searchQuery.value = "";
    }
}

const updateDimensions = () => {
    if (!map.value) return;

    const container = map.value.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newWidth = rect.width;
    const newHeight = rect.height;

    if (newWidth <= 0 || newHeight <= 0) return;

    width.value = newWidth;
    height.value = newHeight;

    projection = createProjection();
    path = createPath(projection);

    redrawMap(true);
};

const createProjection = () => {
    const offsetY = -35;
    const offsetX = 40;

    return d3
        .geoMercator()
        .center([103.8198, 1.3521])
        .scale(Math.min(width.value, height.value) * SCALE_FACTOR)
        .translate([width.value / 2 + offsetX, height.value / 2 + offsetY]);
};

const createPath = (proj) => {
    return d3.geoPath().projection(proj);
};

const createZoom = () => {
    return d3
        .zoom()
        .scaleExtent([1, 8])
        .on("start", () => {
            d3.select(".map-container").style("cursor", "grabbing");
        })
        .on("zoom", (event) => {
            if (mapGroup) {
                mapGroup.attr("transform", event.transform);
            }

            const isZoomed =
                event.transform.k !== 1 ||
                event.transform.x !== 0 ||
                event.transform.y !== 0;
            isMapMoved.value = isZoomed;
        })
        .on("end", () => {
            d3.select(".map-container").style("cursor", "grab");
        });
};

const createLegend = () => {
    const legendContainer = d3.select(legend.value);
    legendContainer.html("");

    if (selectedMode.value === "planning") {
        const resaleHDBsData = resaleHDBs.value.filter(
            (d) => String(d.year) === String(selectedYear.value)
        );

        const medianPriceByPlanningArea = d3.rollup(
            resaleHDBsData,
            (v) => d3.median(v, (d) => +d.resale_price),
            (d) => d.planning_area
        );

        const priceExtent = d3.extent(
            Array.from(medianPriceByPlanningArea.values())
        );

        const colorScale = d3
            .scaleSequential()
            .domain(priceExtent)
            .interpolator((t) => d3.interpolateOranges(t * 0.8 + 0.2));

        const formatPrice = (value) => {
            if (value >= 1000) {
                return (value / 1000).toFixed(0) + "K";
            }
            return value.toString();
        };

        const formatK = (value) => d3.format(".2s")(value).replace("k", "K");
        const minPrice = priceExtent[0] ? formatK(priceExtent[0]) : "N/A";
        const maxPrice = priceExtent[1] ? formatK(priceExtent[1]) : "N/A";

        const legendWidth = 150;
        const legendHeight = 70;
        const titleOffsetY = 12;
        const valueOffsetY = titleOffsetY + 30;
        const gradientOffsetY = valueOffsetY + 10;
        const letterSpacing = "1px";

        const legendSvg = legendContainer
            .append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        const defs = legendSvg.append("defs");
        const linearGradient = defs
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        linearGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", colorScale(priceExtent[0]));

        linearGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", colorScale(priceExtent[1]));

        legendSvg
            .append("text")
            .attr("x", 0)
            .attr("y", titleOffsetY)
            .attr("text-anchor", "left")
            .attr("font-size", "12px")
            .attr("fill", "black")
            .style("letter-spacing", letterSpacing)
            .attr("class", "font-bold")
            .text("LEGEND");

        legendSvg
            .append("rect")
            .attr("width", legendWidth)
            .attr("height", 10)
            .attr("y", gradientOffsetY)
            .style("fill", "url(#gradient)");

        legendSvg
            .append("text")
            .attr("x", 0)
            .attr("y", valueOffsetY)
            .attr("font-size", "10px")
            .attr("fill", "black")
            .text(`${formatPrice(minPrice)}`);

        legendSvg
            .append("text")
            .attr("x", legendWidth - 25)
            .attr("y", valueOffsetY)
            .attr("font-size", "10px")
            .attr("fill", "black")
            .text(`${formatPrice(maxPrice)}`);
    }
};

function drawHistogram(areaName) {
    const container = d3.select("#histogram");
    container.selectAll("*").remove();

    const resaleData = resaleHDBs.value.filter(
        (d) =>
            d.planning_area === areaName &&
            String(d.year) === String(selectedYear.value)
    );

    const prices = resaleData.map((d) => +d.resale_price);
    if (prices.length === 0) return;

    const width = 240;
    const height = 140;
    const margin = { top: 10, right: 10, bottom: 30, left: 35 };

    const svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const x = d3
        .scaleLinear()
        .domain([d3.min(prices), d3.max(prices)])
        .range([margin.left, width - margin.right]);

    const bins = d3.bin().domain(x.domain()).thresholds(15)(prices);

    const y = d3
        .scaleLinear()
        .domain([0, d3.max(bins, (d) => d.length)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.x0) + 1)
        .attr("y", (d) => y(d.length))
        .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
        .attr("height", (d) => y(0) - y(d.length))
        .attr("fill", "#93c5fd");

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format("~s")));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(4));

    const median = d3.median(prices);
    svg.append("line")
        .attr("x1", x(median))
        .attr("x2", x(median))
        .attr("y1", y(0))
        .attr("y2", y(d3.max(bins, (d) => d.length)))
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "4 2");

    svg.append("text")
        .attr("x", x(median) + 4)
        .attr("y", y(d3.max(bins, (d) => d.length)) - 5)
        .attr("fill", "red")
        .attr("font-size", "10px")
        .text("Median");
}

function highlightArea(areaName) {
    hoveredAreaName.value = areaName;
    const feature = planningAreaFeatureMap.value.get(areaName);
    if (!feature) return;

    const svg = d3.select(map.value);

    svg.selectAll("path").each(function (d) {
        d3.select(this).attr("stroke-width", 0.5);
    });

    const pathEl = svg
        .selectAll("path")
        .filter((d) => d === feature)
        .attr("stroke-width", 2.5)
        .attr("stroke", "#4c51bf")
        .style("cursor", "pointer");

    const centroid = path.centroid(feature);

    const resaleData = resaleHDBs.value.filter(
        (r) =>
            r.planning_area === areaName &&
            String(r.year) === String(selectedYear.value)
    );
    const medianPrice = d3.median(resaleData, (r) => +r.resale_price);
    const formattedPrice = medianPrice
        ? `${d3.format(",.2f")(medianPrice)}`
        : "No data";

    d3
        .select(tooltip.value)
        .style("visibility", "visible")
        .style("top", `${centroid[1] - 50}px`)
        .style("left", `${centroid[0] + 10}px`).html(`
            <div class="font-bold text-center">${formattedAreaName(
                areaName
            )}</div>
            <div class="flex flex-row items-center gap-1">
                <div class="tracking-wider">$${formattedPrice}</div>
                <div>Median Price</div>
            </div>
        `);
}

function clearHighlight() {
    hoveredAreaName.value = null;

    d3.select(map.value)
        .selectAll("path")
        .each(function (d) {
            const htmlDoc = new DOMParser().parseFromString(
                d.properties.Description,
                "text/html"
            );
            const cell = Array.from(htmlDoc.querySelectorAll("td")).find(
                (td) => {
                    const prevTh = td.previousElementSibling;
                    return prevTh && prevTh.textContent.trim() === "PLN_AREA_N";
                }
            );

            const areaName = cell?.textContent;
            if (areaName === selectedAreaName.value) {
                d3.select(this)
                    .attr("stroke", "#4c51bf")
                    .attr("stroke-width", 3);
            } else {
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.5);
            }
        });

    d3.select(tooltip.value).style("visibility", "hidden");
}

const redrawMap = (forceReset = false) => {
    if (!map.value || width.value <= 0 || height.value <= 0) return;

    console.log("Redrawing map with dimensions:", width.value, height.value);

    const svg = d3.select(map.value);
    svg.selectAll("*").remove();

    mapGroup = svg.append("g");
    projection = createProjection();
    path = createPath(projection);

    const zoom = createZoom();
    zoomInstance.value = zoom;

    svg.call(zoom);

    svg.append("rect")
        .attr("width", width.value)
        .attr("height", height.value)
        .attr("fill", "transparent")
        .lower()
        .on("click", () => {
            if (selectedMode.value === "planning") {
                selectedArea.value = null;
                selectedAreaInfo.value = null;
                searchQuery.value = "";

                d3.select("#histogram").selectAll("*").remove();

                d3.select(map.value)
                    .selectAll("path")
                    .attr("stroke", "black")
                    .attr("stroke-width", 0.5);
            }
        });

    if (forceReset) {
        svg.call(zoom.transform, d3.zoomIdentity);
    }

    drawMapContent();
    updatePOIs();
};

const formattedAreaName = (area) =>
    area
        ?.toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

const planningAreaNames = computed(() => {
    if (!resaleHDBs.value || !planningAreas.value[2019]) return [];

    const resaleHDBsData = resaleHDBs.value.filter(
        (d) => String(d.year) === String(selectedYear.value)
    );

    const availableAreaSet = new Set(
        resaleHDBsData.map((d) => d.planning_area)
    );

    const features = planningAreas.value[2019]?.features || [];

    return features
        .map((f) => {
            const htmlDoc = new DOMParser().parseFromString(
                f.properties.Description,
                "text/html"
            );
            const cell = Array.from(htmlDoc.querySelectorAll("td")).find(
                (td) => {
                    const prevTh = td.previousElementSibling;
                    return prevTh && prevTh.textContent.trim() === "PLN_AREA_N";
                }
            );
            const areaName = cell?.textContent || "UNKNOWN";
            return availableAreaSet.has(areaName) ? areaName : null;
        })
        .filter(Boolean)
        .sort();
});

const filteredPlanningAreas = computed(() => {
    return planningAreaNames.value.filter((area) =>
        area.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
});

function extractPlanningAreaName(feature) {
    const description = feature.properties.Description;
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(description, "text/html");

    const areaTd = Array.from(htmlDoc.querySelectorAll("td")).find((td) => {
        const prevTh = td.previousElementSibling;
        return prevTh && prevTh.textContent.trim() === "PLN_AREA_N";
    });

    return areaTd?.textContent ?? "UNKNOWN";
}


function selectAreaFromList(areaName) {
    const features = planningAreas.value[2019]?.features || [];

    const match = features.find((f) => {
        const htmlDoc = new DOMParser().parseFromString(
            f.properties.Description,
            "text/html"
        );
        const cell = Array.from(htmlDoc.querySelectorAll("td")).find((td) => {
            const prevTh = td.previousElementSibling;
            return prevTh && prevTh.textContent.trim() === "PLN_AREA_N";
        });
        return cell?.textContent === areaName;
    });

    if (match) {
        zoomToBoundary(match);
        const resaleData = resaleHDBs.value.filter(
            (d) =>
                d.planning_area === areaName &&
                String(d.year) === String(selectedYear.value)
        );
        const medianPrice = d3.median(resaleData, (d) => +d.resale_price);

        selectedAreaInfo.value = {
            name: areaName,
            price: medianPrice || null,
        };

        selectedFeature.value = match;

        nextTick(() => {
            drawHistogram(areaName);

            d3.select(map.value)
                .selectAll("path")
                .each(function (d) {
                    const htmlDoc = new DOMParser().parseFromString(
                        d.properties.Description,
                        "text/html"
                    );
                    const cell = Array.from(
                        htmlDoc.querySelectorAll("td")
                    ).find((td) => {
                        const prevTh = td.previousElementSibling;
                        return (
                            prevTh && prevTh.textContent.trim() === "PLN_AREA_N"
                        );
                    });

                    const name = cell?.textContent;

                    if (name === areaName) {
                        d3.select(this)
                            .attr("stroke", "#4c51bf")
                            .attr("stroke-width", 3);
                    } else {
                        d3.select(this)
                            .attr("stroke", "black")
                            .attr("stroke-width", 0.5);
                    }
                });
        });
    }
}

const drawMapContent = () => {
    if (!mapGroup) return;

    let selectedDataset;

    if (selectedMode.value === "electoral") {
        selectedDataset = electoralBoundaries.value[currentYear.value];
    } else {
        selectedDataset = planningAreas.value[2019];
    }

    if (!selectedDataset || !selectedDataset.features) {
        console.warn(
            `No data for ${selectedMode.value} in ${currentYear.value}`
        );
        return;
    }

    if (selectedMode.value === "electoral") {
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
                parseFloat(
                    constituencyToParty[upperConstituency].vote_percentage
                )
            ) {
                constituencyToParty[upperConstituency] = {
                    party,
                    vote_count,
                    vote_percentage,
                };
            }
        });

        selectedDataset.features.forEach((feature) => {
            let constituencyName;

            if (currentYear.value === 2020) {
                constituencyName = feature.properties.Name.toUpperCase();
            } else {
                const description = feature.properties.Description;
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(
                    description,
                    "text/html"
                );
                const edDescTd = Array.from(
                    htmlDoc.querySelectorAll("td")
                ).find((td) => {
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
            .data(selectedDataset.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d) => {
                if (selectedMode.value === "electoral") {
                    return d.properties.color;
                }
                return "lightblue";
            })
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .style("pointer-events", "visible")
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .attr("stroke-width", 1.5)
                    .style("cursor", "pointer");

                let areaName;

                if (selectedMode.value === "electoral") {
                    if (currentYear.value === 2020) {
                        areaName = d.properties.Name || "Unknown Constituency";
                    } else {
                        const description = d.properties.Description;
                        const parser = new DOMParser();
                        const htmlDoc = parser.parseFromString(
                            description,
                            "text/html"
                        );
                        const edDescTd = Array.from(
                            htmlDoc.querySelectorAll("td")
                        ).find((td) => {
                            const prevTh = td.previousElementSibling;
                            return (
                                prevTh &&
                                prevTh.textContent.trim() === "ED_DESC"
                            );
                        });

                        if (edDescTd) {
                            areaName = edDescTd.textContent;
                        } else {
                            areaName = "UNKNOWN";
                        }
                    }
                }

                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(
                        `<div id="constituency-name">${areaName
                            .toLowerCase()
                            .split(" ")
                            .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")
                            .replace(
                                /\b(\w+)-(\w+)\b/g,
                                (match, p1, p2) =>
                                    `${p1}\-${p2
                                        .charAt(0)
                                        .toUpperCase()}${p2.slice(1)}`
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
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 50}px`)
                    .style("left", `${mouseX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(this).attr("stroke-width", 0.5);
                d3.select(tooltip.value).style("visibility", "hidden");
            })
            .on("click", function (event, d) {
                zoomToBoundary(d);

                selectedAreaInfo.value = {
                    name: areaName,
                    price: medianPrice || null,
                };

                nextTick(() => {
                    drawHistogram(areaName);
                });
            });
    }

    if (selectedMode.value === "planning") {
        selectedDataset = planningAreas.value[2019];

        const resaleHDBsData = resaleHDBs.value.filter(
            (d) => String(d.year) === String(selectedYear.value)
        );

        const medianPriceByPlanningArea = d3.rollup(
            resaleHDBsData,
            (v) => d3.median(v, (d) => +d.resale_price),
            (d) => d.planning_area
        );

        const priceExtent = d3.extent(
            Array.from(medianPriceByPlanningArea.values())
        );
        const colorScale = d3
            .scaleSequential()
            .domain(priceExtent)
            .interpolator((t) => d3.interpolateOranges(t * 0.8 + 0.2));

        mapGroup
            .selectAll("path.planning")
            .data(selectedDataset.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", (d) => {
                let areaName;
                const description = d.properties.Description;
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(
                    description,
                    "text/html"
                );
                const edDescTd = Array.from(
                    htmlDoc.querySelectorAll("td")
                ).find((td) => {
                    const prevTh = td.previousElementSibling;
                    return prevTh && prevTh.textContent.trim() === "PLN_AREA_N";
                });

                if (edDescTd) {
                    areaName = edDescTd.textContent;
                }

                const medianPrice = medianPriceByPlanningArea.get(areaName);

                if (!medianPrice) {
                    d.properties.noData = true;
                    return "lightgray";
                }

                d.properties.noData = false;
                return colorScale(medianPrice);
            })
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .style("pointer-events", "visible")
            .on("mouseover", function (event, d) {
                if (d.properties.noData) return;

                d3.select(this)
                    .attr("stroke", "#4c51bf")
                    .attr("stroke-width", 2.5)
                    .style("cursor", "pointer");

                const areaName = extractPlanningAreaName(d);

                if (tooltipLocked.value && selectedAreaName.value === areaName) return;

                const medianPrice = medianPriceByPlanningArea.get(areaName);
                const formattedPrice = medianPrice
                    ? `${d3.format(",.2f")(medianPrice)}`
                    : "No data";

                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(
                        `<div class="font-bold text-center">${areaName
                            .toLowerCase()
                            .split(" ")
                            .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")
                            .replace(
                                /\b(\w+)-(\w+)\b/g,
                                (match, p1, p2) =>
                                    `${p1}\-${p2
                                        .charAt(0)
                                        .toUpperCase()}${p2.slice(1)}`
                            )}</div>
                            <div class="flex flex-row items-center gap-1">
                                <div class="tracking-wider">$${formattedPrice}</div>
                                <div>
                                    Median Price
                                </div>
                            </div>
                    `
                    );
            })
            .on("mousemove", (event) => {
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 30}px`)
                    .style("left", `${mouseX + 10}px`);
            })
            .on("mouseout", function (event, d) {
                const htmlDoc = new DOMParser().parseFromString(
                    d.properties.Description,
                    "text/html"
                );
                const cell = Array.from(htmlDoc.querySelectorAll("td")).find(
                    (td) => {
                        const prevTh = td.previousElementSibling;
                        return (
                            prevTh && prevTh.textContent.trim() === "PLN_AREA_N"
                        );
                    }
                );

                const areaName = cell?.textContent;

                if (areaName === selectedAreaName.value) {
                    d3.select(this)
                        .attr("stroke", "#4c51bf")
                        .attr("stroke-width", 3);
                } else {
                    d3.select(this)
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.5);
                }

                d3.select(tooltip.value).style("visibility", "hidden");
            })
            .on("click", (event, d) => {
                if (d.properties.noData) {
                    selectedArea.value = null;
                    selectedAreaInfo.value = null;
                    searchQuery.value = "";
                    d3.select("#histogram").selectAll("*").remove();

                    d3.select(map.value)
                        .selectAll("path")
                        .attr("stroke", "black")
                        .attr("stroke-width", 0.5);
                    return;
                }

                zoomToBoundary(d);

                let areaName;
                const description = d.properties.Description;
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(
                    description,
                    "text/html"
                );
                const edDescTd = Array.from(
                    htmlDoc.querySelectorAll("td")
                ).find((td) => {
                    const prevTh = td.previousElementSibling;
                    return prevTh && prevTh.textContent.trim() === "PLN_AREA_N";
                });

                if (edDescTd) {
                    areaName = edDescTd.textContent;
                } else {
                    areaName = "UNKNOWN";
                }

                const medianPrice = medianPriceByPlanningArea.get(areaName);

                selectedAreaInfo.value = {
                    name: areaName,
                    price: medianPrice || null,
                };

                selectedArea.value = {
                    value: areaName,
                    label: formattedAreaName(areaName),
                };
                searchQuery.value = formattedAreaName(areaName);

                tooltipLocked.value = true;
                d3.select(tooltip.value).style("visibility", "hidden");

                nextTick(() => {
                    drawHistogram(areaName);
                });
            });
    }
};

const planningAreaOptions = computed(() =>
    planningAreaNames.value
        .filter((area) =>
            area.toLowerCase().includes(searchQuery.value.toLowerCase())
        )
        .map((area) => ({
            value: area,
            label: formattedAreaName(area),
        }))
);

const clearSearch = () => {
    searchQuery.value = "";
    selectedArea.value = null;
    selectedAreaInfo.value = null;
    tooltipLocked.value = false;

    const container = d3.select("#histogram");
    container.selectAll("*").remove();

    d3.select(map.value)
        .selectAll("path")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5);
};

const updateYear = (value) => {
    selectedYear.value = Array.isArray(value) ? value[0] : value;

    if (selectedMode.value === "electoral") {
        if (selectedYear.value < 2011) {
            currentYear.value = 2006;
        } else if (selectedYear.value < 2015) {
            currentYear.value = 2011;
        } else if (selectedYear.value < 2020) {
            currentYear.value = 2015;
        } else {
            currentYear.value = 2020;
        }
    } else {
        if (selectedYear.value < 2019) {
            currentYear.value = 2019;
        } else {
            currentYear.value = 2019;
        }
    }
};

const planningAreaFeatureMap = computed(() => {
    const map = new Map();
    if (!planningAreas.value[2019]) return map;

    planningAreas.value[2019].features.forEach((feature) => {
        const htmlDoc = new DOMParser().parseFromString(
            feature.properties.Description,
            "text/html"
        );
        const cell = Array.from(htmlDoc.querySelectorAll("td")).find((td) => {
            const prevTh = td.previousElementSibling;
            return prevTh && prevTh.textContent.trim() === "PLN_AREA_N";
        });

        const areaName = cell?.textContent;
        if (areaName) {
            map.set(areaName, feature);
        }
    });

    return map;
});

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
    primarySchools.value = await d3.csv(
        "/data/point_of_interest/PrimarySchoolsLocation.csv"
    );
    secondarySchools.value = await d3.csv(
        "/data/point_of_interest/SecondarySchoolsLocation.csv"
    );
    juniorColleges.value = await d3.csv(
        "/data/point_of_interest/JuniorCollegesLocation.csv"
    );
    polytechnics.value = await d3.csv(
        "/data/point_of_interest/PolytechnicsLocation.csv"
    );
    universities.value = await d3.csv(
        "/data/point_of_interest/UniversitiesLocation.csv"
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

    planningAreas.value = {
        2019: await d3.json(
            "/data/master_plan/MasterPlan2019PlanningAreaBoundaryNoSea.geojson"
        ),
    };
};

async function loadResaleDataForYear(year) {
    const url = `/data/resale_prices_cleaned/HDBPriceWithSubzone_${year}.csv`;
    try {
        resaleHDBs.value = await d3.csv(url, (d) => ({
            ...d,
            planning_area: d["Planning Area"],
            resale_price: +d["Resale Price"],
            year: +d["Year"],
        }));
    } catch (err) {
        console.error(`Failed to load resale data for ${year}:`, err);
        resaleHDBs.value = [];
    }
}

const resetZoom = () => {
    if (!map.value || !zoomInstance.value) return;

    const svg = d3.select(map.value);
    svg.transition()
        .duration(750)
        .call(zoomInstance.value.transform, d3.zoomIdentity)
        .on("end", () => {
            isMapMoved.value = false;
        });
};

onMounted(async () => {
    await loadData();

    resizeObserver = new ResizeObserver(() => updateDimensions());

    await nextTick();

    if (map.value && map.value.parentElement) {
        resizeObserver.observe(map.value.parentElement);
    }

    window.addEventListener("resize", updateDimensions);

    updateDimensions();
});

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect();
    }
    window.removeEventListener("resize", updateDimensions);
});

function updatePOIs() {
    if (!mapGroup) return;

    mapGroup.selectAll(".poi").remove();

    if (
        showHawkerCentres.value &&
        hawkerCentres.value &&
        hawkerCentres.value.features
    ) {
        mapGroup
            .selectAll(".hawker")
            .data(hawkerCentres.value.features)
            .enter()
            .append("circle")
            .attr("class", "poi hawker")
            .attr("cx", (d) => projection(d.geometry.coordinates)[0])
            .attr("cy", (d) => projection(d.geometry.coordinates)[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "red")
            .on("mouseover", function (event, d) {
                const description = d.properties.Description;
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(
                    description,
                    "text/html"
                );

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
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
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
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "blue")
            .on("mouseover", function (event, d) {
                const description = d.properties.Description;
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(
                    description,
                    "text/html"
                );

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
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
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
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "green")
            .on("mouseover", function (event, d) {
                const name =
                    d.properties.NAME.toLowerCase()
                        .split(" ")
                        .map(
                            (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ") || "Name not available";

                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`${name}`);
            })
            .on("mousemove", function (event) {
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
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
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "purple")
            .on("mouseover", function (event, d) {
                const name =
                    d.properties.Name.toLowerCase()
                        .split(" ")
                        .map(
                            (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ") + " MRT" || "Name not available";

                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`${name}`);
            })
            .on("mousemove", function (event) {
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
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
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "orange")
            .on("mouseover", function (event, d) {
                const getValueFromTable = (label) => {
                    const description = d.properties.Description;
                    const parser = new DOMParser();
                    const htmlDoc = parser.parseFromString(
                        description,
                        "text/html"
                    );
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
                    getValueFromTable("CENTRE_NAME") || "Name not available";

                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`${name}`);
            })
            .on("mousemove", function (event) {
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(tooltip.value).style("visibility", "hidden");
            });
    }

    if (showPrimarySchools.value && primarySchools.value) {
        mapGroup
            .selectAll(".primary-school")
            .data(primarySchools.value)
            .enter()
            .append("circle")
            .attr("class", "poi primary-school")
            .attr("cx", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[0] : 0;
            })
            .attr("cy", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[1] : 0;
            })
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "orange")
            .on("mouseover", function (event, d) {
                const name = d.school_name || "Name not available";

                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`${name}`);
            })
            .on("mousemove", function (event) {
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(tooltip.value).style("visibility", "hidden");
            });
    }

    if (showSecondarySchools.value && secondarySchools.value) {
        mapGroup
            .selectAll(".secondary-school")
            .data(secondarySchools.value)
            .enter()
            .append("circle")
            .attr("class", "poi secondary-school")
            .attr("cx", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[0] : 0;
            })
            .attr("cy", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[1] : 0;
            })
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "purple")
            .on("mouseover", function (event, d) {
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`<b>${d.school_name}</b>`);
            })
            .on("mousemove", function (event) {
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(tooltip.value).style("visibility", "hidden");
            });
    }

    if (showJuniorColleges.value && juniorColleges.value) {
        mapGroup
            .selectAll(".junior-college")
            .data(juniorColleges.value)
            .enter()
            .append("circle")
            .attr("class", "poi junior-college")
            .attr("cx", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[0] : 0;
            })
            .attr("cy", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[1] : 0;
            })
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "purple")
            .on("mouseover", function (event, d) {
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`<b>${d.school_name}</b>`);
            })
            .on("mousemove", function (event) {
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(tooltip.value).style("visibility", "hidden");
            });
    }

    if (showPolytechnics.value && polytechnics.value) {
        mapGroup
            .selectAll(".polytechnic")
            .data(polytechnics.value)
            .enter()
            .append("circle")
            .attr("class", "poi polytechnic")
            .attr("cx", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[0] : 0;
            })
            .attr("cy", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[1] : 0;
            })
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "purple")
            .on("mouseover", function (event, d) {
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`<b>${d.school_name}</b>`);
            })
            .on("mousemove", function (event) {
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(tooltip.value).style("visibility", "hidden");
            });
    }

    if (showUniversities.value && universities.value) {
        mapGroup
            .selectAll(".university")
            .data(universities.value)
            .enter()
            .append("circle")
            .attr("class", "poi university")
            .attr("cx", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[0] : 0;
            })
            .attr("cy", (d) => {
                const coords = projection([
                    parseFloat(d.long),
                    parseFloat(d.lat),
                ]);
                return coords ? coords[1] : 0;
            })
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "purple")
            .on("mouseover", function (event, d) {
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`<b>${d.school_name}</b>`);
            })
            .on("mousemove", function (event) {
                const [mouseX, mouseY] = d3.pointer(event, map.value);

                d3.select(tooltip.value)
                    .style("top", `${mouseY - 20}px`)
                    .style("left", `${mouseX + 10}px`);
            })
            .on("mouseout", function () {
                d3.select(tooltip.value).style("visibility", "hidden");
            });
    }
}

watch(
    [
        showHawkerCentres,
        showGyms,
        showParks,
        showMrts,
        showPreschools,
        showPrimarySchools,
        showSecondarySchools,
        showJuniorColleges,
        showPolytechnics,
        showUniversities,
    ],
    () => {
        updatePOIs();
    },
    { deep: true }
);

watch([selectedYear, selectedMode], async () => {
    console.log(`Updating map for year: ${selectedYear.value}`);

    await loadResaleDataForYear(selectedYear.value);

    if (selectedMode.value === "planning") {
        currentYear.value = selectedYear.value;
    }

    redrawMap();
    createLegend();
});

watch(selectedArea, (newArea) => {
    if (newArea?.value) {
        selectAreaFromList(newArea.value);
    }
});

function zoomToBoundary(boundary) {
    if (!path || !zoomInstance.value) return;

    const bounds = path.bounds(boundary);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const centerX = (bounds[0][0] + bounds[1][0]) / 2;
    const centerY = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = 0.5 / Math.max(dx / width.value, dy / height.value);
    const translateX = width.value / 2 - scale * centerX;
    const translateY = height.value / 2 - scale * centerY;

    const svg = d3.select(map.value);

    svg.transition()
        .duration(750)
        .call(
            zoomInstance.value.transform,
            d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
}
</script>

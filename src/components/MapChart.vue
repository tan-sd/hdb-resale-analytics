<template>
    <div class="map-container w-full h-full">
        <div ref="tooltip" class="tooltip"></div>
        <div
            ref="histogramTooltip"
            class="tooltip absolute z-50 pointer-events-none text-xs bg-white px-2 py-1 border border-gray-300 rounded shadow"
            style="visibility: hidden"
        ></div>
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
                    class="w-full flex flex-row gap-2 px-4 py-2 rounded-md shadow-lg text-xs bg-white border-none"
                >
                    <Select v-model="selectedYear">
                        <SelectTrigger
                            class="w-[130px] text-xs h-8 flex items-center gap-1"
                        >
                            <div class="flex items-center gap-1">
                                <Calendar :size="16" />
                                <span class="font-semibold">Year:</span>
                            </div>
                            <SelectValue :placeholder="selectedYear" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem
                                    v-for="year in [...Array(2023 - 1990 + 1)]
                                        .map((_, i) => 1990 + i)
                                        .reverse()"
                                    :key="year"
                                    :value="String(year)"
                                >
                                    {{ year }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select v-model="selectedFlatType">
                        <SelectTrigger
                            class="w-[150px] text-xs h-8 flex items-center gap-1"
                        >
                            <div class="flex items-center gap-1">
                                <House :size="16" />
                                <span class="font-semibold">Flat Type:</span>
                            </div>
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All</SelectItem>
                            <SelectGroup>
                                <SelectItem value="1 ROOM">1 Room</SelectItem>
                                <SelectItem value="2 ROOM">2 Room</SelectItem>
                                <SelectItem value="3 ROOM">3 Room</SelectItem>
                                <SelectItem value="4 ROOM">4 Room</SelectItem>
                                <SelectItem value="5 ROOM">5 Room</SelectItem>
                                <SelectItem value="EXECUTIVE"
                                    >Executive</SelectItem
                                >
                                <SelectItem value="MULTI-GENERATION"
                                    >Multi-Generation</SelectItem
                                >
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <!-- <div class="text-xs font-medium flex items-center gap-2">
                        <Calendar :size="16" /> Year {{ selectedYear }} 
                    </div>
                    <div class="flex flex-row gap-2">
                        <Button
                            variant="outline"
                            :disabled="selectedYear <= 1990"
                            class="p-2 rounded-md"
                            @click="changeYear('left')"
                        >
                            <ChevronLeft />
                        </Button>
                        
                        <Button
                            variant="outline"
                            :disabled="selectedYear >= 2023"
                            class="p-2 rounded-md"
                            @click="changeYear('right')"
                        >
                            <ChevronRight/>
                        </Button>
                    </div> -->
                    <!-- <Slider
                        :model-value="[selectedYear]"
                        :min="1990"
                        :max="2023"
                        :step="1"
                        class="w-full mt-2 mb-2"
                        @update:modelValue="updateYear"
                    /> -->
                </div>
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
                class="absolute top-4 left-4 w-80 bg-white rounded-md shadow-lg px-3 py-2 text-sm z-20 flex flex-col cursor-default"
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
                    v-if="selectedAreaInfo?.name"
                    class="mt-5 text-xs flex flex-row justify-center items-center gap-4 w-full"
                >
                    <!-- Left Column: Ruling Party (Label + Content stacked) -->
                    <div class="flex flex-col justify-center">
                        <span class="font-medium">Ruling Party</span>
                        <div
                            class="flex justify-center items-center gap-2 mt-1"
                        >
                            <span>
                                {{
                                    planningAreaFeatureMap.get(
                                        selectedAreaInfo.name
                                    )?.properties?.rulingParty ?? "N/A"
                                }}
                            </span>
                            <img
                                :src="
                                    'img/' +
                                    planningAreaFeatureMap.get(
                                        selectedAreaInfo.name
                                    )?.properties?.rulingParty +
                                    '.png'
                                "
                                class="w-5 h-auto"
                                alt="Party Logo"
                            />
                        </div>
                    </div>

                    <!-- Right Column: Vertically Centered Amenities Button -->
                    <div class="flex items-center">
                        <Drawer>
                            <DrawerTrigger as-child>
                                <Button
                                    variant="outline"
                                    class="px-4 py-2 rounded-md text-xs h-8 gap-1 items-center flex"
                                >
                                    <MapPinned /> Amenities
                                </Button>
                            </DrawerTrigger>
                            <DrawerContent>
                                <div class="mx-auto w-full max-w-sm">
                                    <DrawerHeader>
                                        <DrawerTitle>Amenities</DrawerTitle>
                                        <DrawerDescription>
                                            Select locations to display
                                        </DrawerDescription>
                                    </DrawerHeader>

                                    <div class="grid grid-cols-2 gap-4">
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showHawkerCentres"
                                                id="hawker-centres"
                                                :disabled="!hasHawkerCentres"
                                            />
                                            <label
                                                for="hawker-centres"
                                                class="text-sm font-medium"
                                                >Hawker Centres</label
                                            >
                                        </div>
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showGyms"
                                                id="gyms"
                                                :disabled="!hasGyms"
                                            />
                                            <label
                                                for="gyms"
                                                class="text-sm font-medium"
                                                >Gyms</label
                                            >
                                        </div>
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showParks"
                                                id="parks"
                                                :disabled="!hasParks"
                                            />
                                            <label
                                                for="parks"
                                                class="text-sm font-medium"
                                                >Parks</label
                                            >
                                        </div>
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showMrts"
                                                id="mrts"
                                                :disabled="!hasMrts"
                                            />
                                            <label
                                                for="mrts"
                                                class="text-sm font-medium"
                                                >MRT Stations</label
                                            >
                                        </div>
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showMalls"
                                                id="malls"
                                                :disabled="!hasMalls"
                                            />
                                            <label
                                                for="malls"
                                                class="text-sm font-medium"
                                                >Malls</label
                                            >
                                        </div>
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showPrimarySchools"
                                                id="primary-schools"
                                                :disabled="!hasPrimarySchools"
                                            />
                                            <label
                                                for="primary-schools"
                                                class="text-sm font-medium"
                                                >Primary Schools</label
                                            >
                                        </div>
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showSecondarySchools"
                                                id="secondary-schools"
                                                :disabled="!hasSecondarySchools"
                                            />
                                            <label
                                                for="secondary-schools"
                                                class="text-sm font-medium"
                                                >Secondary Schools</label
                                            >
                                        </div>
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showJuniorColleges"
                                                id="junior-colleges"
                                                :disabled="!hasJuniorColleges"
                                            />
                                            <label
                                                for="junior-colleges"
                                                class="text-sm font-medium"
                                                >Junior Colleges</label
                                            >
                                        </div>
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showPolytechnics"
                                                id="polytechnics"
                                                :disabled="!hasPolytechnics"
                                            />
                                            <label
                                                for="polytechnics"
                                                class="text-sm font-medium"
                                                >Polytechnics</label
                                            >
                                        </div>
                                        <div
                                            class="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                v-model="showUniversities"
                                                id="universities"
                                                :disabled="!hasUniversities"
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
                                                >Close</Button
                                            >
                                        </DrawerClose>
                                    </DrawerFooter>
                                </div>
                            </DrawerContent>
                        </Drawer>
                    </div>
                </div>

                <div
                    v-if="selectedAreaInfo?.name"
                    class="mt-10 text-xs flex flex-col justify-center items-center gap-1"
                >
                    <div class="flex items-center gap-1">
                        <span class="font-medium"
                            >HDB Resale Price Distribution</span
                        >
                    </div>
                    <div
                        id="histogram"
                        :class="selectedAreaInfo ? 'w-full mt-1' : ''"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import * as d3 from "d3";
import { ref, onMounted, watch, onUnmounted, nextTick, computed } from "vue";
import * as turf from "@turf/turf";
import { useDataStore } from "../stores/dataStore";
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
import { MapPinned, Calendar, Search, X, House, Locate } from "lucide-vue-next";

const dataStore = useDataStore();

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
const showMalls = ref(false);

const minYear = 1990;
const maxYear = 2023;
const selectedYear = ref("2023");
const selectedFlatType = ref("All");
const currentYear = ref(2023);
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
const malls = ref(null);
const rulingPartyByEDYear = {};
const medianPriceForHistogram = ref(null);
const histogramTooltip = ref(null);

const emit = defineEmits([
    "areaSelected",
    "resetSelection",
    "selectedFlatType",
]);

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

const changeYear = (direction) => {
    if (direction === "left" && selectedYear.value > minYear) {
        selectedYear.value--;
    } else if (direction === "right" && selectedYear.value < maxYear) {
        selectedYear.value++;
    }
};

const selectedAreaName = computed(() => selectedAreaInfo.value?.name ?? null);

let path;
let projection;
let resizeObserver = null;
let mapGroup = null;

function emitAggregatedStats() {
    if (!dataStore.chartData) return;

    const filteredData = dataStore.chartData.filter(
        (d) => String(d["Year"]) === String(selectedYear.value)
    );

    const totalUnits = filteredData.length;
    const totalPrice = d3.sum(filteredData, (d) => +d["Resale Price"]);

    const pricePerSqm = d3.median(filteredData, (d) => {
        return +d["Resale Price"] / +d["Floor Area Sqm"];
    });

    emit("areaSelected", {
        areaName: "All Singapore",
        totalUnits,
        totalPrice,
        pricePerSqm,
        year: selectedYear.value,
        isAggregated: true,
        rawData: filteredData,
    });
}

function handleSelection(area) {
    if (area) {
        searchQuery.value = area.label;
        selectedArea.value = area;

        const areaName = area.value;
        const resaleHDBsData = dataStore.chartData.filter(
            (d) =>
                d["Planning Area"] === areaName &&
                String(d["Year"]) === String(selectedYear.value) &&
                (selectedFlatType.value === "All" ||
                    d["Flat Type"] === selectedFlatType.value)
        );

        const totalUnits = resaleHDBsData.length;
        const totalPrice = d3.sum(resaleHDBsData, (d) => +d["Resale Price"]);

        const pricePerSqm = d3.median(resaleHDBsData, (d) => {
            return +d["Resale Price"] / +d["Floor Area Sqm"];
        });

        emit("areaSelected", {
            areaName,
            totalUnits,
            totalPrice,
            pricePerSqm,
            year: selectedYear.value,
            rawData: resaleHDBsData,
        });

        resetAmenityToggles();
    } else {
        searchQuery.value = "";
        selectedArea.value = null;
        emitAggregatedStats();
        resetAmenityToggles();
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
    const offsetY = -10;
    const offsetX = -30;

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
    const data = dataStore.chartData;

    const filtered = data.filter(
        (d) =>
            String(d["Year"]) === String(selectedYear.value) &&
            (selectedFlatType.value === "All" ||
                d["Flat Type"] === selectedFlatType.value)
    );

    const legendContainer = d3.select(legend.value);
    legendContainer.html("");

    const resaleHDBsData = dataStore.chartData.filter(
        (d) => String(d["Year"]) === String(selectedYear.value)
    );

    const medianPriceByPlanningArea = d3.rollup(
        filtered,
        (v) => d3.median(v, (d) => +d["Resale Price"]),
        (d) => d["Planning Area"]
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
        .attr("font-size", "10px")
        .attr("fill", "black")
        .style("letter-spacing", letterSpacing)
        .attr("class", "font-bold")
        .text("MEDIAN RESALE PRICE");

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
};

function resetAmenityToggles() {
    showHawkerCentres.value = false;
    showGyms.value = false;
    showParks.value = false;
    showMrts.value = false;
    showPreschools.value = false;
    showPrimarySchools.value = false;
    showSecondarySchools.value = false;
    showJuniorColleges.value = false;
    showPolytechnics.value = false;
    showUniversities.value = false;
    showMalls.value = false;
}

function drawHistogram(areaName) {
    const container = d3.select("#histogram");
    container.selectAll("*").remove();

    const resaleData = dataStore.chartData.filter(
        (d) =>
            d["Planning Area"] === areaName &&
            String(d["Year"]) === String(selectedYear.value) &&
            (selectedFlatType.value === "All" ||
                d["Flat Type"] === selectedFlatType.value)
    );

    const prices = resaleData.map((d) => +d["Resale Price"]);

    if (prices.length === 0) {
        container
            .append("div")
            .attr("class", "text-center text-gray-500 text-xs mt-2")
            .text("No data available for this area and year.");
        return;
    }

    const containerNode = document.getElementById("histogram");
    const containerWidth = containerNode?.offsetWidth || 400;

    const width = containerWidth;
    const height = 140;
    const margin = { top: 20, right: 10, bottom: 30, left: 35 };

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
        .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("height", (d) => y(0) - y(d.length))
        .attr("fill", "#93c5fd")
        .on("mouseover", function (event, d) {
            d3.select(this).attr("fill", "#60a5fa");
            d3
                .select(histogramTooltip.value)
                .style("visibility", "visible").html(`
        <div><strong>${d.length}</strong> resale units</div>
        <div>Price range: $${d3.format(",")(
            d.x0
        )} – $${d3.format(",")(d.x1)}</div>
      `);
        })
        .on("mousemove", function (event) {
            const [mouseX, mouseY] = d3.pointer(event, map.value);
            d3.select(histogramTooltip.value)
                .style("left", `${mouseX + 15}px`)
                .style("top", `${mouseY}px`);
        })
        .on("mouseout", function () {
            d3.select(this).attr("fill", "#93c5fd");
            d3.select(histogramTooltip.value).style("visibility", "hidden");
        });

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(4).tickFormat(d3.format("~s")));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(4));

    const median = d3.median(prices);
    medianPriceForHistogram.value = median;

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
        .text("Median" + ": $" + d3.format(",")(median));
}

const redrawMap = (forceReset = false) => {
    if (!map.value || width.value <= 0 || height.value <= 0) return;

    console.log("Redrawing map with dimensions:", width.value, height.value);

    const svg = d3.select(map.value);
    const currentTransform = svg.property("__zoom") || d3.zoomIdentity;

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
            selectedArea.value = null;
            selectedAreaInfo.value = null;
            searchQuery.value = "";

            resetAmenityToggles();

            d3.select("#histogram").selectAll("*").remove();

            d3.select(map.value)
                .selectAll("path")
                .attr("stroke", "black")
                .attr("stroke-width", 0.5);

            emitAggregatedStats();
        });

    if (forceReset) {
        svg.call(zoom.transform, d3.zoomIdentity);
    } else {
        svg.call(zoom.transform, currentTransform);
    }

    drawMapContent();
    updatePOIs();

    if (selectedAreaName.value) {
        nextTick(() => {
            drawHistogram(selectedAreaName.value);
            const svg = d3.select(map.value);

            svg.selectAll("path").each(function (d) {
                const areaName = extractPlanningAreaName(d);
                if (areaName === selectedAreaName.value) {
                    d3.select(this)
                        .attr("stroke", "#4c51bf")
                        .attr("stroke-width", 3);
                }
            });
        });
    }
};

const formattedAreaName = (area) =>
    area
        ?.toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

const planningAreaNames = computed(() => {
    if (!dataStore.chartData || !planningAreas.value[2019]) return [];

    const resaleHDBsData = dataStore.chartData.filter(
        (d) => String(d["Year"]) === String(selectedYear.value)
    );

    const availableAreaSet = new Set(
        resaleHDBsData.map((d) => d["Planning Area"])
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
        const resaleData = dataStore.chartData.filter(
            (d) =>
                d["Planning Area"] === areaName &&
                String(d["Year"]) === String(selectedYear.value)
        );
        const medianPrice = d3.median(resaleData, (d) => +d["Resale Price"]);

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

            // const buildingsInArea = resaleHDBs.value.filter(
            //     (d) =>
            //         d["Planning Area"] === areaName &&
            //         String(d["Year"]) === String(selectedYear.value)
            // );

            // mapGroup.selectAll(".building-dot").remove();

            // mapGroup
            //     .selectAll(".building-dot")
            //     .data(buildingsInArea)
            //     .enter()
            //     .append("circle")
            //     .attr("class", "building-dot")
            //     .attr("cx", (d) => projection([+d.Longitude, +d.Latitude])[0])
            //     .attr("cy", (d) => projection([+d.Longitude, +d.Latitude])[1])
            //     .attr("r", 1)
            //     .attr("fill", "#38bdf8")
            //     .attr("stroke", "#1e40af")
            //     .attr("stroke-width", 0.5)
            //     .attr("opacity", 0.8);
        });
    }
}

const drawMapContent = () => {
    if (!mapGroup) return;

    let selectedDataset;

    selectedDataset = planningAreas.value[2019];

    const resaleHDBsData = dataStore.chartData.filter(
        (d) =>
            String(d["Year"]) === String(selectedYear.value) &&
            (selectedFlatType.value === "All" ||
                d["Flat Type"] === selectedFlatType.value)
    );

    const medianPriceByPlanningArea = d3.rollup(
        resaleHDBsData,
        (v) => d3.median(v, (d) => +d["Resale Price"]),
        (d) => d["Planning Area"]
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
            const htmlDoc = parser.parseFromString(description, "text/html");
            const edDescTd = Array.from(htmlDoc.querySelectorAll("td")).find(
                (td) => {
                    const prevTh = td.previousElementSibling;
                    return prevTh && prevTh.textContent.trim() === "PLN_AREA_N";
                }
            );

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

            if (tooltipLocked.value && selectedAreaName.value === areaName)
                return;

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
                                `${p1}\-${p2.charAt(0).toUpperCase()}${p2.slice(
                                    1
                                )}`
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

                emitAggregatedStats();

                return;
            }

            zoomToBoundary(d);

            let areaName;
            const description = d.properties.Description;
            const parser = new DOMParser();
            const htmlDoc = parser.parseFromString(description, "text/html");
            const edDescTd = Array.from(htmlDoc.querySelectorAll("td")).find(
                (td) => {
                    const prevTh = td.previousElementSibling;
                    return prevTh && prevTh.textContent.trim() === "PLN_AREA_N";
                }
            );

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

            resetAmenityToggles();

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

            const resaleHDBsData = dataStore.chartData.filter(
                (d) =>
                    d["Planning Area"] === areaName &&
                    String(d["Year"]) === String(selectedYear.value)
            );

            const totalUnits = resaleHDBsData.length;
            const totalPrice = d3.sum(
                resaleHDBsData,
                (d) => +d["Resale Price"]
            );

            const pricePerSqm = d3.median(resaleHDBsData, (d) => {
                return +d["Resale Price"] / +d["Floor Area Sqm"];
            });

            emit("areaSelected", {
                areaName,
                totalUnits,
                totalPrice,
                pricePerSqm,
                year: selectedYear.value,
                rawData: resaleHDBsData,
            });
        });
    planningAreas.value[2019].features.forEach((paFeature) => {
        const paCenter = turf.center(paFeature);
        const edFeatures = electoralBoundaries.value[2020].features;

        for (const edFeature of edFeatures) {
            if (turf.booleanPointInPolygon(paCenter, edFeature)) {
                const constituency =
                    edFeature.properties.ED_DESC || edFeature.properties.Name;
                const key = `2020_${constituency}`;
                const ruling = rulingPartyByEDYear[key]?.party || "UNKNOWN";

                paFeature.properties.rulingParty = ruling;
                break;
            }
        }
    });
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

    resetAmenityToggles();

    const container = d3.select("#histogram");
    container.selectAll("*").remove();

    d3.select(map.value)
        .selectAll("path")
        .attr("stroke", "black")
        .attr("stroke-width", 0.5);

    emitAggregatedStats();
};

const updateYear = (value) => {
    selectedYear.value = Array.isArray(value) ? value[0] : value;

    if (selectedYear.value < 2019) {
        currentYear.value = 2019;
    } else {
        currentYear.value = 2019;
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

    electionResults.value.forEach((row) => {
        const year = row["year"];
        const ed = row["constituency"].toUpperCase();
        const party = row["party"];
        const votes = +row["vote_count"] || 0;

        const key = `${year}_${ed}`;
        if (
            !rulingPartyByEDYear[key] ||
            votes > rulingPartyByEDYear[key].votes
        ) {
            rulingPartyByEDYear[key] = { party, votes };
        }
    });

    hawkerCentres.value = await d3.csv(
        "/data/point_of_interest/joined_hawker_centres.csv"
    );
    gyms.value = await d3.csv("/data/point_of_interest/joined_gyms.csv");
    parks.value = await d3.csv("/data/point_of_interest/joined_parks.csv");
    mrts.value = await d3.csv(
        "/data/point_of_interest/joined_mrt_stations.csv"
    );
    // preschools.value = await d3.json(
    //     "/data/point_of_interest/PreSchoolsLocation.geojson"
    // );
    primarySchools.value = await d3.csv(
        "/data/point_of_interest/joined_primary_schools_gdf.csv"
    );
    secondarySchools.value = await d3.csv(
        "/data/point_of_interest/joined_secondary_schools.csv"
    );
    juniorColleges.value = await d3.csv(
        "/data/point_of_interest/joined_junior_colleges.csv"
    );
    polytechnics.value = await d3.csv(
        "/data/point_of_interest/joined_polytechnics_gdf.csv"
    );
    universities.value = await d3.csv(
        "/data/point_of_interest/joined_universities.csv"
    );
    malls.value = await d3.csv("/data/point_of_interest/joined_malls.csv");

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

    createLegend();

    emitAggregatedStats();
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

    if (showHawkerCentres.value && hawkerCentres.value) {
        const hawkersInArea = selectedAreaName.value
            ? hawkerCentres.value.filter(
                  (d) =>
                      d["planning_area"]?.toLowerCase() ===
                      selectedAreaName.value.toLowerCase()
              )
            : hawkerCentres.value;

        mapGroup
            .selectAll(".hawker")
            .data(hawkersInArea)
            .enter()
            .append("circle")
            .attr("class", "poi hawker")
            .attr("cx", (d) => projection([+d["longitude"], +d["latitude"]])[0])
            .attr("cy", (d) => projection([+d["longitude"], +d["latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#e03131")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";

                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`Hawker Centre: <strong>${name}</strong>`);
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

    if (showGyms.value && gyms.value) {
        const gymsInArea = selectedAreaName.value
            ? gyms.value.filter(
                  (d) =>
                      d.planning_area.toUpperCase() === selectedAreaName.value
              )
            : gyms.value;

        mapGroup
            .selectAll(".gym")
            .data(gymsInArea)
            .enter()
            .append("circle")
            .attr("class", "poi gym")
            .attr("cx", (d) => projection([+d["longitude"], +d["latitude"]])[0])
            .attr("cy", (d) => projection([+d["longitude"], +d["latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#b33dc6")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`Gym: <strong>${name}</strong>`);
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

    if (showParks.value && parks.value) {
        const parksInArea = selectedAreaName.value
            ? parks.value.filter(
                  (d) =>
                      d.planning_area.toUpperCase() === selectedAreaName.value
              )
            : parks.value;

        mapGroup
            .selectAll(".park")
            .data(parksInArea)
            .enter()
            .append("circle")
            .attr("class", "poi park")
            .attr("cx", (d) => projection([+d["longitude"], +d["latitude"]])[0])
            .attr("cy", (d) => projection([+d["longitude"], +d["latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#87bc45")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`Park: <strong>${name}</strong>`);
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

    if (showMrts.value && mrts.value) {
        const mrtsInArea = selectedAreaName.value
            ? mrts.value.filter(
                  (d) =>
                      d.planning_area.toUpperCase() === selectedAreaName.value
              )
            : mrts.value;

        mapGroup
            .selectAll(".mrt")
            .data(mrtsInArea)
            .enter()
            .append("circle")
            .attr("class", "poi mrt")
            .attr("cx", (d) => projection([+d["Longitude"], +d["Latitude"]])[0])
            .attr("cy", (d) => projection([+d["Longitude"], +d["Latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#f46a9b")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`Station: <strong>${name}</strong>`);
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

    if (showMalls.value && malls.value) {
        const mallsInArea = selectedAreaName.value
            ? malls.value.filter(
                  (d) =>
                      d.planning_area &&
                      d.planning_area.toUpperCase() === selectedAreaName.value
              )
            : malls.value;

        mapGroup
            .selectAll(".mall")
            .data(mallsInArea)
            .enter()
            .append("circle")
            .attr("class", "poi mall")
            .attr("cx", (d) => projection([+d["Longitude"], +d["Latitude"]])[0])
            .attr("cy", (d) => projection([+d["Longitude"], +d["Latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#ea5545")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`Mall: <strong>${name}</strong>`);
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
        const schoolsInArea = selectedAreaName.value
            ? primarySchools.value.filter(
                  (d) =>
                      d.planning_area &&
                      d.planning_area.toUpperCase() === selectedAreaName.value
              )
            : primarySchools.value;

        mapGroup
            .selectAll(".primary-school")
            .data(schoolsInArea)
            .enter()
            .append("circle")
            .attr("class", "poi primary-school")
            .attr("cx", (d) => projection([+d["Longitude"], +d["Latitude"]])[0])
            .attr("cy", (d) => projection([+d["Longitude"], +d["Latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#ef9b20")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`Primary School: <strong>${name}</strong>`);
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
        const schoolsInArea = selectedAreaName.value
            ? secondarySchools.value.filter(
                  (d) =>
                      d.planning_area &&
                      d.planning_area.toUpperCase() === selectedAreaName.value
              )
            : secondarySchools.value;

        mapGroup
            .selectAll(".secondary-school")
            .data(schoolsInArea)
            .enter()
            .append("circle")
            .attr("class", "poi secondary-school")
            .attr("cx", (d) => projection([+d["Longitude"], +d["Latitude"]])[0])
            .attr("cy", (d) => projection([+d["Longitude"], +d["Latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#edbf33")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`Secondary School: <strong>${name}</strong>`);
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
        const schoolsInArea = selectedAreaName.value
            ? juniorColleges.value.filter(
                  (d) =>
                      d.planning_area &&
                      d.planning_area.toUpperCase() === selectedAreaName.value
              )
            : juniorColleges.value;

        mapGroup
            .selectAll(".junior-college")
            .data(schoolsInArea)
            .enter()
            .append("circle")
            .attr("class", "poi junior-college")
            .attr("cx", (d) => projection([+d["Longitude"], +d["Latitude"]])[0])
            .attr("cy", (d) => projection([+d["Longitude"], +d["Latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#bdcf32")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`Junior College: <strong>${name}</strong>`);
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
        const schoolsInArea = selectedAreaName.value
            ? polytechnics.value.filter(
                  (d) =>
                      d.planning_area &&
                      d.planning_area.toUpperCase() === selectedAreaName.value
              )
            : polytechnics.value;

        mapGroup
            .selectAll(".polytechnic")
            .data(schoolsInArea)
            .enter()
            .append("circle")
            .attr("class", "poi polytechnic")
            .attr("cx", (d) => projection([+d["Longitude"], +d["Latitude"]])[0])
            .attr("cy", (d) => projection([+d["Longitude"], +d["Latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#1a53ff")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`Polytechnic: <strong>${name}</strong>`);
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
        const schoolsInArea = selectedAreaName.value
            ? universities.value.filter(
                  (d) =>
                      d.planning_area &&
                      d.planning_area.toUpperCase() === selectedAreaName.value
              )
            : universities.value;

        mapGroup
            .selectAll(".university")
            .data(schoolsInArea)
            .enter()
            .append("circle")
            .attr("class", "poi university")
            .attr("cx", (d) => projection([+d["Longitude"], +d["Latitude"]])[0])
            .attr("cy", (d) => projection([+d["Longitude"], +d["Latitude"]])[1])
            .attr("r", 1)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", "#27aeef")
            .on("mouseover", function (event, d) {
                const name = d.name || "Name not available";
                d3.select(tooltip.value)
                    .style("visibility", "visible")
                    .html(`University: <strong>${name}</strong>`);
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

const hasHawkerCentres = computed(() => {
    if (!hawkerCentres.value) return false;
    if (!selectedAreaName.value) return hawkerCentres.value.length > 0;

    return hawkerCentres.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

const hasGyms = computed(() => {
    if (!gyms.value) return false;
    if (!selectedAreaName.value) return gyms.value.length > 0;

    return gyms.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

const hasParks = computed(() => {
    if (!parks.value) return false;
    if (!selectedAreaName.value) return parks.value.length > 0;

    return parks.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

const hasMrts = computed(() => {
    if (!mrts.value) return false;
    if (!selectedAreaName.value) return mrts.value.length > 0;

    return mrts.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

const hasPrimarySchools = computed(() => {
    if (!primarySchools.value) return false;
    if (!selectedAreaName.value) return primarySchools.value.length > 0;

    return primarySchools.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

const hasSecondarySchools = computed(() => {
    if (!secondarySchools.value) return false;
    if (!selectedAreaName.value) return secondarySchools.value.length > 0;

    return secondarySchools.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

const hasJuniorColleges = computed(() => {
    if (!juniorColleges.value) return false;
    if (!selectedAreaName.value) return juniorColleges.value.length > 0;

    return juniorColleges.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

const hasPolytechnics = computed(() => {
    if (!polytechnics.value) return false;
    if (!selectedAreaName.value) return polytechnics.value.length > 0;

    return polytechnics.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

const hasUniversities = computed(() => {
    if (!universities.value) return false;
    if (!selectedAreaName.value) return universities.value.length > 0;

    return universities.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

const hasMalls = computed(() => {
    if (!malls.value) return false;
    if (!selectedAreaName.value) return malls.value.length > 0;

    return malls.value.some(
        (d) => d.planning_area?.toUpperCase() === selectedAreaName.value
    );
});

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
        showMalls,
    ],
    () => {
        updatePOIs();
    },
    { deep: true }
);

watch([selectedYear], async () => {
    console.log(`Updating map for year: ${selectedYear.value}`);

    currentYear.value = selectedYear.value;

    redrawMap();
    createLegend();

    if (!selectedArea.value) {
        emitAggregatedStats();
    } else {
        const areaName = selectedArea.value.value;
        const resaleHDBsData = dataStore.chartData.filter(
            (d) =>
                d["Planning Area"] === areaName &&
                String(d["Year"]) === String(selectedYear.value)
        );

        const totalUnits = resaleHDBsData.length;
        const totalPrice = d3.sum(resaleHDBsData, (d) => +d["Resale Price"]);

        const pricePerSqm = d3.median(resaleHDBsData, (d) => {
            return +d["Resale Price"] / +d["Floor Area Sqm"];
        });

        emit("areaSelected", {
            areaName,
            totalUnits,
            totalPrice,
            pricePerSqm,
            year: selectedYear.value,
            rawData: resaleHDBsData,
        });
    }
});

watch(selectedFlatType, (newVal) => {
    console.log("MapChart emitting:", newVal);

    emit("selectedFlatType", newVal);

    redrawMap();
    createLegend();

    if (selectedAreaName.value) {
        nextTick(() => {
            drawHistogram(selectedAreaName.value);
        });
    }

    if (!selectedArea.value) {
        emitAggregatedStats();
    } else {
        const areaName = selectedArea.value.value;
        const resaleHDBsData = dataStore.chartData.filter(
            (d) =>
                d["Planning Area"] === areaName &&
                String(d["Year"]) === String(selectedYear.value) &&
                (selectedFlatType.value === "All" ||
                    d["Flat Type"] === selectedFlatType.value)
        );

        const totalUnits = resaleHDBsData.length;
        const totalPrice = d3.sum(resaleHDBsData, (d) => +d["Resale Price"]);
        const pricePerSqm = d3.median(
            resaleHDBsData,
            (d) => +d["Resale Price"] / +d["Floor Area Sqm"]
        );

        emit("areaSelected", {
            areaName,
            totalUnits,
            totalPrice,
            pricePerSqm,
            year: selectedYear.value,
            rawData: resaleHDBsData,
        });
    }
});

watch(selectedYear, async () => {
    console.log(`Updating map for year: ${selectedYear.value}`);

    currentYear.value = selectedYear.value;

    redrawMap();
    createLegend();

    if (!selectedArea.value) {
        emitAggregatedStats();
    } else {
        const areaName = selectedArea.value.value;
        const resaleHDBsData = dataStore.chartData.filter(
            (d) =>
                d["Planning Area"] === areaName &&
                String(d["Year"]) === String(selectedYear.value)
        );

        const totalUnits = resaleHDBsData.length;
        const totalPrice = d3.sum(resaleHDBsData, (d) => +d["Resale Price"]);

        const pricePerSqm = d3.median(resaleHDBsData, (d) => {
            return +d["Resale Price"] / +d["Floor Area Sqm"];
        });

        emit("areaSelected", {
            areaName,
            totalUnits,
            totalPrice,
            pricePerSqm,
            year: selectedYear.value,
            rawData: resaleHDBsData,
        });
    }
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
    const translateX = width.value * 0.75 - scale * centerX;
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

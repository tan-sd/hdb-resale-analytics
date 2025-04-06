<template>
    <main class="flex flex-1 flex-col mt-[50vh] items-center justify-center">
        <h2
            class="text-sm sm:text-base font-bold uppercase tracking-tight mb-2 section-title"
        >
            Your Turn to Explore
        </h2>
        <p class="text-center text-xs md:text-sm leading-relaxed mb-5">
            Explore how HDB resale prices have changed over the years and
            uncover the different factors that may have influenced them.
            <br />
            Click or tap on the interactive map, or search by planning area to
            begin your journey.
        </p>
        <div class="w-full px-4 py-6 mx-auto">
            <section
                class="overflow-hidden rounded-[0.5rem] border shadow"
                style="background-color: #ffffff"
            >

            <div class="grid grid-cols-1 lg:grid-cols-7 gap-4">
  <!-- LEFT SIDE: col-span-2 -->
  <div class="space-y-4 lg:col-span-3">
    <!-- TOP: Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card class="w-full h-full flex flex-col">
                                        <CardContent class="flex-grow p-4">
                                            <div
                                                class="font-medium text-sm text-muted-foreground mb-1"
                                            >
                                                Number of HDB Units Resold
                                            </div>
                                            <div class="text-2xl font-bold">
                                                <NumberFlow
                                                    :value="
                                                        selectedAreaStats?.totalUnits ||
                                                        0
                                                    "
                                                />
                                            </div>
                                            <div
                                                class="text-xs text-muted-foreground mt-1"
                                            >
                                                {{
                                                    selectedAreaStats.isAggregated
                                                        ? "Across Singapore"
                                                        : `in ${selectedAreaStats.areaName}`
                                                }}
                                                ({{ selectedAreaStats.year }})
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card class="w-full h-full flex flex-col">
                                        <CardContent class="flex-grow p-4">
                                            <div
                                                class="font-medium text-sm text-muted-foreground mb-1"
                                            >
                                                Total Transaction Price
                                            </div>
                                            <div class="text-2xl font-bold">
                                                $<NumberFlow
                                                    :value="
                                                        selectedAreaStats.totalPrice
                                                            ? selectedAreaStats.totalPrice.toFixed(
                                                                  2
                                                              )
                                                            : 0.0
                                                    "
                                                />
                                            </div>
                                            <div
                                                class="text-xs text-muted-foreground mt-1"
                                            >
                                                {{
                                                    selectedAreaStats.isAggregated
                                                        ? "Across Singapore"
                                                        : `in ${selectedAreaStats.areaName}`
                                                }}
                                                ({{ selectedAreaStats.year }})
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card class="w-full h-full flex flex-col">
                                        <CardContent class="flex-grow p-4">
                                            <div
                                                class="font-medium text-sm text-muted-foreground mb-1"
                                            >
                                                Price Per Square Meter
                                            </div>
                                            <div class="text-2xl font-bold">
                                                $<NumberFlow
                                                    :value="
                                                        selectedAreaStats.pricePerSqm
                                                            ? selectedAreaStats.pricePerSqm.toFixed(
                                                                  0
                                                              )
                                                            : 0
                                                    "
                                                />
                                            </div>
                                            <div
                                                class="text-xs text-muted-foreground mt-1"
                                            >
                                                {{
                                                    selectedAreaStats.isAggregated
                                                        ? "Median across Singapore"
                                                        : `Median in ${selectedAreaStats.areaName}`
                                                }}
                                                ({{ selectedAreaStats.year }})
                                            </div>
                                        </CardContent>
                                    </Card>
    </div>

    <!-- MIDDLE: MapChart -->
    <Card class="w-full h-[490px] flex flex-col">
      <CardContent class="p-0">
        <MapChart
          @area-selected="handleAreaSelected"
          @selected-flat-type="handleFlatTypeChange"
        />
      </CardContent>
    </Card>

    <!-- 🔽 NEW: BOTTOM Demographics + Amenities charts go HERE -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Demographics Distribution -->
      <Card class="w-full h-full flex flex-col">
        <CardContent class="flex-grow p-4 h-[290px]">
          <div class="font-medium text-sm text-muted-foreground mb-1">
            Demographics Distribution
            <span class="text-xs" v-if="usingFallbackYear">
              (Using {{ fallbackYearValue }} Demographic Data)
            </span>
          </div>
          <DemographicsBarChartDashboard
            class="w-full h-full"
            ref="demographicsChart"
            :data="filteredData"
            :area-name="selectedAreaStats.areaName"
            :year="selectedAreaStats.year"
            @update:fallback-year="handleFallbackYear"
          />
        </CardContent>
      </Card>

      <!-- Amenities Distribution -->
      <Card class="w-full h-full flex flex-col">
        <CardContent class="flex-grow p-4 h-[290px]">
          <div class="font-medium text-sm text-muted-foreground mb-1">
            Amenities Distribution
          </div>
          <BarChartAmenitiesDashboard
            class="w-full h-full"
            :data="filteredData"
            :area-name="selectedAreaStats.areaName"
            :year="selectedAreaStats.year"
          />
        </CardContent>
      </Card>
    </div>
  </div>

  <!-- RIGHT COLUMN -->
  <div class="space-y-4 lg:col-span-4">
    <!-- TOP: Flat Type + Storey Range side by side -->
    <div
  :class="selectedFlatType === 'All' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'"
>
  <Card
    v-if="selectedFlatType === 'All'"
    class="w-full h-full flex flex-col"
  >
    <CardContent class="flex-grow p-4 h-[290px]">
      <div class="font-medium text-sm text-muted-foreground mb-1">
        Flat Type Distribution
      </div>
      <FlatTypeBarChartDashboard
        :data="filteredData"
        :area-name="selectedAreaStats.areaName"
        :year="selectedAreaStats.year"
        :selected-flat-type="selectedFlatType"
      />
    </CardContent>
  </Card>

  <Card
    :class="selectedFlatType !== 'All' ? 'col-span-full' : ''"
    class="w-full h-full flex flex-col"
  >
    <CardContent class="flex-grow p-4 h-[290px]">
      <div class="font-medium text-sm text-muted-foreground mb-1">
        Storey Range Distribution
      </div>
      <StoreyRangeBarChart
        :data="filteredData"
        :area-name="selectedAreaStats.areaName"
        :year="selectedAreaStats.year"
        :selected-flat-type="selectedFlatType"
      />
    </CardContent>
  </Card>
</div>


    <!-- BOTTOM: Median Resale Price & Transactions stacked -->
    <div class="space-y-4">
      <Card class="w-full h-full flex flex-col">
        <CardContent class="p-4 h-[300px]">
          <div class="font-medium text-sm text-muted-foreground mb-1">
            Median Resale Price By Year
            <span v-if="selectedFlatType !== 'All'">({{ selectedFlatType }})</span>
          </div>
          <LineChartMedianResaleDashboard :selected-flat-type="selectedFlatType" />
        </CardContent>
      </Card>

      <Card class="w-full h-full flex flex-col">
        <CardContent class="p-4 h-[300px]">
          <div class="font-medium text-sm text-muted-foreground mb-1">
            Annual Transactions
            <span v-if="selectedFlatType !== 'All'">({{ selectedFlatType }})</span>
          </div>
          <LineChartTransactionsDashboard :selected-flat-type="selectedFlatType" />
        </CardContent>
      </Card>
    </div>
  </div>
</div>
            </section>
        </div>
    </main>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import NumberFlow from "@number-flow/vue";
import FlatTypeBarChartDashboard from "./BarChartFlatTypeDashboard.vue";
import StoreyRangeBarChart from "./BarChartStoreyRange.vue";
import PriceByFlatTypeChart from "./BarChartFlatType.vue";
import DemographicsBarChartDashboard from "./BarChartDemographicsDashboard.vue";
import BarChartAmenitiesDashboard from "./BarChartAmenitiesDashboard.vue";
import LineChartMedianResaleDashboard from "./LineChartMedianResaleDashboard.vue";
import LineChartTransactionsDashboard from "./LineChartTransactionsDashboard.vue";
import MapChart from "./MapChart.vue";
import { ref, computed, watch } from "vue";

const usingFallbackYear = ref(false);
const fallbackYearValue = ref(null);
const selectedFlatType = ref("All");
const demographicsChart = ref(null);

const handleFallbackYear = (data) => {
    usingFallbackYear.value = data.isFallback;
    fallbackYearValue.value = data.year;
};

function handleFlatTypeChange(newFlatType) {
  console.log("Flat type changed to:", newFlatType);
  selectedFlatType.value = newFlatType;
}

watch(() => selectedFlatType.value, (newVal) => {
  console.log("Flat type updated (watcher):", newVal);
}, { immediate: true });

const selectedAreaStats = ref({
    areaName: "All Singapore",
    totalUnits: 0,
    totalPrice: 0,
    pricePerSqm: 0,
    year: null,
    isAggregated: true,
    rawData: [],
});

const filteredData = computed(() => {
    return selectedAreaStats.value.rawData || [];
});

function handleAreaSelected(data) {
    selectedAreaStats.value = data;
}

function emitAggregatedStats() {
    if (!resaleHDBs.value) return;

    const filteredData = resaleHDBs.value.filter(
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
</script>

<style scoped>
number-flow-vue {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
}
</style>

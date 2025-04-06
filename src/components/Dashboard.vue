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
        <div class="container py-6">
            <section
                class="overflow-hidden rounded-[0.5rem] border shadow"
                style="background-color: #ffffff"
            >
                <div class="flex flex-col">
                    <div class="flex-1 space-y-4 p-8 pt-6">
                        <div
                            class="flex items-center justify-between space-y-2"
                        ></div>
                        <Tabs defaultValue="overview" class="space-y-4">
                            <TabsContent value="overview" class="space-y-4">
                                <div
                                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
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
                                <div class="grid gap-4">
                                    <Card class="w-full h-full flex flex-col">
                                        <CardContent class="flex-grow p-0">
                                            <MapChart
                                                @area-selected="
                                                    handleAreaSelected
                                                "
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                                <div
                                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                    <Card class="w-full h-full flex flex-col">
                                        <CardContent
                                            class="flex-grow p-4 h-[290px]"
                                        >
                                            <div
                                                class="font-medium text-sm text-muted-foreground mb-1"
                                            >
                                                Flat Type Distribution
                                            </div>
                                            <FlatTypeBarChartDashboard
                                                :data="filteredData"
                                                :area-name="
                                                    selectedAreaStats.areaName
                                                "
                                                :year="selectedAreaStats.year"
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card class="w-full h-full flex flex-col">
                                        <CardContent
                                            class="flex-grow p-4 h-[290px]"
                                        >
                                            <div
                                                class="font-medium text-sm text-muted-foreground mb-1"
                                            >
                                                Storey Range Distribution
                                            </div>
                                            <StoreyRangePieChart
                                                :data="filteredData"
                                                :area-name="
                                                    selectedAreaStats.areaName
                                                "
                                                :year="selectedAreaStats.year"
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card class="w-full h-full flex flex-col">
                                        <CardContent
                                            class="flex-grow p-4 h-[290px]"
                                        >
                                            <div
                                                class="font-medium text-sm text-muted-foreground mb-1"
                                            >
                                                Average Price by Flat Type
                                            </div>
                                            <PriceByFlatTypeChart
                                                :data="filteredData"
                                                :area-name="
                                                    selectedAreaStats.areaName
                                                "
                                                :year="selectedAreaStats.year"
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                                <div
                                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                    <Card class="w-full h-full flex flex-col">
                                        <CardContent
                                            class="flex-grow p-4 h-[290px]"
                                        >
                                            <div
                                                class="font-medium text-sm text-muted-foreground mb-1"
                                            >
                                                Demographics Distribution <span class="text-xs" v-if="usingFallbackYear"> (Using {{ fallbackYearValue }} Demographic Data)</span>
                                            </div>
                                            <DemographicsBarChartDashboard
                                                ref="demographicsChart"
                                                :data="filteredData"
                                                :area-name="
                                                    selectedAreaStats.areaName
                                                "
                                                :year="selectedAreaStats.year"
                                                @update:fallback-year="handleFallbackYear"
                                            />
                                        </CardContent>
                                    </Card>

                                    <Card class="w-full h-full flex flex-col">
                                        <CardContent
                                            class="flex-grow p-4 h-[290px]"
                                        >
                                            <div
                                                class="font-medium text-sm text-muted-foreground mb-1"
                                            >
                                                ...
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card class="w-full h-full flex flex-col">
                                        <CardContent
                                            class="flex-grow p-4 h-[290px]"
                                        >
                                            <div
                                                class="font-medium text-sm text-muted-foreground mb-1"
                                            >
                                                ...
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
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
import StoreyRangePieChart from "./PieChartStoreyRange.vue";
import PriceByFlatTypeChart from "./BarChartFlatType.vue";
import DemographicsBarChartDashboard from "./BarChartDemographicsDashboard.vue";
import MapChart from "./MapChart.vue";
import { ref, computed } from "vue";

const usingFallbackYear = ref(false);
const fallbackYearValue = ref(null);

const demographicsChart = ref(null);

const handleFallbackYear = (data) => {
    usingFallbackYear.value = data.isFallback;
    fallbackYearValue.value = data.year;
};

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

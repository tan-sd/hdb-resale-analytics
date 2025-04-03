import { ref, computed } from "vue";
import { defineStore } from "pinia";
import * as d3 from "d3";

export const useDataStore = defineStore("dataStore", () => {
    let rawChartData = null;
    const chartData = computed(() => rawChartData ?? []);
    const yearMedians = ref([]);
    const yearCounts = ref([]);
    const yearFlatTypeMedians = ref([]);
    const storeyPriceScatter = ref([]);
    const pricePerSqmByPlanningArea = ref([]);
    const ethnicDistribution = ref([]);
    const affordabilityIndex = ref([]);
    const hsdResaleTrend = ref([]);

    const isDataLoaded = computed(() => rawChartData !== null);
    const isDataReady = computed(() => yearMedians.value.length > 0);

    async function loadData() {
        if (isDataLoaded.value) return;

        try {
            const ethnicData = await d3.csv(
                "data/population_demographics/ethnic_distribution.csv"
            );
            const data = await Promise.all([
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1990.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1991.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1992.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1993.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1994.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1995.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1996.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1997.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1998.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_1999.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2000.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2001.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2002.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2003.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2004.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2005.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2006.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2007.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2008.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2009.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2010.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2011.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2012.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2013.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2014.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2015.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2016.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2017.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2018.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2019.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2020.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2021.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2022.csv"
                ),
                d3.csv(
                    "data/resale_prices_cleaned/HDBPriceWithSubzone_2023.csv"
                ),
            ]);

            rawChartData = data.flat();
            ethnicDistribution.value = ethnicData.map((d) => ({
                planningArea: d["Planning Area"].toUpperCase(),
                year: +d["Year"],
                chinese: +d["chinese"],
                malays: +d["malays"],
                indian: +d["indian"],
                others: +d["others"],
            }));

            const medianMonthlyIncome = {
                2022: 10099,
                2021: 9520,
                2020: 9189,
                2019: 9425,
                2018: 9293,
                2017: 9023,
                2016: 8846,
                2015: 8666,
                2014: 8292,
                2013: 7872,
                2012: 7566,
                2011: 7037,
                2010: 6342,
                2009: 6006,
                2008: 6100,
                2007: 5362,
                2006: 4952,
                2005: 4831,
                2004: 4552,
                2003: 4612,
                2002: 4590,
                2001: 4716,
                2000: 4398,
            };            
            
            const priceByYear = d3.group(rawChartData, d => +d.Year);
            const processedAffordability = [];

            for (const [year, records] of priceByYear.entries()) {
                if (!medianMonthlyIncome[year]) continue;

                const resalePrices = records
                    .map(d => parseFloat(d["Resale Price"]))
                    .filter(v => !isNaN(v));

                if (resalePrices.length === 0) continue;

                const medianPrice = d3.median(resalePrices);
                const annualIncome = medianMonthlyIncome[year] * 12;
                const index = medianPrice / annualIncome;

                processedAffordability.push({
                    Year: year,
                    AffordabilityIndex: +index.toFixed(2),
                });
            }

            processedAffordability.sort((a, b) => a.Year - b.Year);
            affordabilityIndex.value = processedAffordability;

            preprocessData();
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    function preprocessData() {
        if (!rawChartData) return;

        const groupedByYear = d3.group(rawChartData, (d) => d.Year);
        const groupedByArea = d3.group(rawChartData, (d) => d["Planning Area"]);

        const processedYearMedians = [];
        const processedYearCounts = [];
        const processedYearFlatTypeMedians = [];
        const processedStoreyPriceScatter = [];
        const processedBoxplot = [];

        const tierClassifier = (distance) => {
            const d = parseFloat(distance);
            if (isNaN(d)) return null;
            if (d <= 1000) return "Within 1km";
            if (d <= 2000) return "Within 2km";
            return "More than 2km";
        };
        const hsdMap = new Map()



        groupedByYear.forEach((values, year) => {
            const median = d3.median(values, (d) =>
                parseFloat(d["Resale Price"])
            );
            processedYearMedians.push({
                Year: parseInt(year),
                median: median,
            });

            processedYearCounts.push({
                Year: parseInt(year),
                count: values.length,
            });

            const groupedByFlatType = d3.group(values, (d) => d["Flat Type"]);
            groupedByFlatType.forEach((entries, flatType) => {
                const flatMedian = d3.median(entries, (d) =>
                    parseFloat(d["Resale Price"])
                );
                processedYearFlatTypeMedians.push({
                    Year: parseInt(year),
                    FlatType: flatType,
                    median: flatMedian,
                });
            });

            // chartData.value.forEach((d) => {
            //   const lower = parseInt(d["Storey Lower"]);
            //   const upper = parseInt(d["Storey Upper"]);
            //   const avgStorey = Math.round((lower + upper) / 2);
            //   const resalePrice = parseFloat(d["Resale Price"]);

            //   if (!isNaN(avgStorey) && !isNaN(resalePrice)) {
            //     processedStoreyPriceScatter.push({
            //       AvgStorey: avgStorey,
            //       ResalePrice: resalePrice,
            //     });
            //   }
            // });
        });

        groupedByArea.forEach((entries, area) => {
            if (!area || area.trim() === "") return;

            const values = entries
                .map((d) => {
                    const price = parseFloat(d["Resale Price Adj 2024"]);
                    const sqm = parseFloat(d["Floor Area Sqm"]);
                    return sqm > 0 ? price / sqm : null;
                })
                .filter((v) => !isNaN(v));

            if (values.length > 0) {
                processedBoxplot.push({
                    area,
                    values,
                });
            }
        });

        // HSD Trend: Median resale price per sqm by distance tier
        const processedHsdTrend = [];
        rawChartData.forEach((d) => {
            const year = +d.Year;
            const dist = d["Closest Pri Sch Dist"];
            const tier = tierClassifier(dist);
            const price = parseFloat(d["Resale Price"]);

            if (!tier || isNaN(year) || isNaN(price)) return;
            const key = `${year}|${tier}`;
            if (!hsdMap.has(key)) hsdMap.set(key, []);
            hsdMap.get(key).push(price);
        });

        hsdMap.forEach((values, key) => {
            const [year, tier] = key.split("|");
            const medianValue = d3.median(values);
            processedHsdTrend.push({
                year: +year,
                tier,
                value: +medianValue.toFixed(2),
            });
        });

        processedHsdTrend.sort((a, b) => a.year - b.year);
        hsdResaleTrend.value = processedHsdTrend;


        processedYearMedians.sort((a, b) => a.Year - b.Year);
        processedYearFlatTypeMedians.sort((a, b) => a.Year - b.Year);

        yearMedians.value = processedYearMedians;
        yearCounts.value = processedYearCounts;
        yearFlatTypeMedians.value = processedYearFlatTypeMedians;
        // storeyPriceScatter.value = processedStoreyPriceScatter;
        pricePerSqmByPlanningArea.value = processedBoxplot;

    }

    function ensureDataLoaded() {
        if (!isDataLoaded.value) {
            return loadData();
        }
        return Promise.resolve();
    }

    return {
        rawChartData,
        chartData,
        yearMedians,
        yearCounts,
        yearFlatTypeMedians,
        pricePerSqmByPlanningArea,
        ethnicDistribution,
        affordabilityIndex,
        // storeyPriceScatter,
        hsdResaleTrend,
        isDataLoaded,
        isDataReady,
        loadData,
        preprocessData,
        ensureDataLoaded,
    };
});

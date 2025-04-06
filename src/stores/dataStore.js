import { ref, computed } from "vue";
import { defineStore } from "pinia";
import * as d3 from "d3";
import { and } from "mathjs";

let rawChartData = null;


const aboveGroundStations = new Set([
    "Ang Mo Kio MRT Station",
    "Yio Chu Kang MRT Station",
    "Khatib MRT Station",
    "Yishun MRT Station",
    "Canberra MRT Station",
    "Sembawang MRT Station",
    "Admiralty MRT Station",
    "Woodlands MRT Station",
    "Marsiling MRT Station",
    "Kranji MRT Station",
    "Yew Tee MRT Station",
    "Choa Chu Kang MRT Station",
    "Bukit Gombak MRT Station",
    "Bukit Batok MRT Station",
    "Jurong East MRT Station",
    "Clementi MRT Station",
    "Dover MRT Station",
    "Buona Vista MRT Station",
    "Commonwealth MRT Station",
    "Queenstown MRT Station",
    "Redhill MRT Station",
    "Tiong Bahru MRT Station",
    "Kallang MRT Station",
    "Aljunied MRT Station",
    "Paya Lebar MRT Station",
    "Eunos MRT Station",
    "Kembangan MRT Station",
    "Bedok MRT Station",
    "Tanah Merah MRT Station",
    "Simei MRT Station",
    "Tampines MRT Station",
    "Pasir Ris MRT Station",
    "Chinese Garden MRT Station",
    "Lakeside MRT Station",
    "Boon Lay MRT Station",
    "Pioneer MRT Station",
    "Joo Koon MRT Station",
    "Gul Circle MRT Station",
    "Tuas Crescent MRT Station",
    "Tuas West Road MRT Station",
    "Tuas Link MRT Station"
  ]);

export const useDataStore = defineStore("dataStore", () => {
    const chartData = computed(() => rawChartData ?? []);
    const isDataLoaded = computed(() => rawChartData !== null);

    const yearMedians = ref([]);
    const yearCounts = ref([]);
    const yearFlatTypeMedians = ref([]);
    const pricePerSqmByPlanningArea = ref([]);
    const ethnicDistribution = ref([]);
    const affordabilityIndex = ref([]);
    const hsdResaleTrend = ref([]);
    const borderFlats = ref([]);
    const leaseTrend = ref([]);
    const ageAndDwellingTypeData = ref([]);
    const amenitiesByPlanningArea = ref(null);
    const sampledChartData = computed(() => {
        if (!rawChartData) return [];

        const filtered = rawChartData
            .filter((d) => d.Year > 2017)
            .filter((d) => d["Years Remaining"] > 84) // ✅ only long lease
    
        const sampleSize = Math.ceil(filtered.length * 0.5); // 50% sample
    
        return d3.shuffle(filtered)
            .slice(0, sampleSize)
            .map((d) => ({
                mrtDist: d["Closest Mrt Dist"],
                pricePerSqm: d["Resale Price"] / d["Floor Area Sqm"],
                yearsRemaining: d["Years Remaining"],
                closestMrt: d["Closest Mrt"],
                mrtType: !aboveGroundStations.has(d["Closest Mrt"]) ? "Above" : "Underground",
            }));
    });
    

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

    async function loadData() {
        if (isDataLoaded.value) return;

        try {
            amenitiesByPlanningArea.value = await d3.csv(
                "data/point_of_interest/amenities_by_planning_area.csv",
                d3.autoType
            );
            
            const ethnicData = await d3.csv(
                "data/population_demographics/ethnic_distribution.csv",
                d3.autoType
            );

            const borderFlatsData = await d3.csv(
                "data/resale_prices_cleaned/BorderFlats.csv"
            );

            ageAndDwellingTypeData.value = await d3.csv(
                "data/population_demographics/age_and_dwelling_type.csv",
                d3.autoType
            )

            const groupedData = d3.group(
                borderFlatsData,
                (d) => d.Period,
                (d) => d.Zone
            );
            borderFlats.value = Array.from(groupedData, ([period, zones]) => {
                return Array.from(zones, ([zone, records]) => {
                    return {
                        period,
                        zone,
                        values: records.map((r) =>
                            parseFloat(r["Resale Price Adj 2024"])
                        ),
                    };
                });
            }).flat();
            
            ethnicDistribution.value = ethnicData.map((d) => ({
                planningArea: d["Planning Area"].toUpperCase(),
                year: +d["Year"],
                chinese: +d["chinese"],
                malays: +d["malays"],
                indian: +d["indian"],
                others: +d["others"],
            }));

            const splitHdbResaleData = Array.from(
                { length: 2023 - 1990 + 1 },
                (_, i) => {
                    return `data/resale_prices_cleaned/HDBPriceWithSubzone_${
                        1990 + i
                    }.csv`;
                }
            );

            const combinedHdbResaleData = await Promise.all(
                splitHdbResaleData.map((d) => d3.csv(d, d3.autoType))
            );

            rawChartData = combinedHdbResaleData.flat();

            preprocessData();
        } catch (error) {
            console.error("Error loading data:", error);
        }
    }

    function preprocessData() {
        if (!rawChartData) return;

        const processedAffordability = [];
        const groupedByYear = d3.group(rawChartData, (d) => d.Year);

        for (const [year, records] of groupedByYear.entries()) {
            if (!medianMonthlyIncome[year]) continue;

            const resalePrices = records
                .map((d) => +d["Resale Price"])
                .filter((v) => !isNaN(v));

            if (resalePrices.length === 0) continue;

            const medianPrice = d3.median(resalePrices);
            const annualIncome = medianMonthlyIncome[year] * 12;
            const index = medianPrice / annualIncome;

            processedAffordability.push({
                Year: +year,
                AffordabilityIndex: +index.toFixed(2),
            });
        }

        processedAffordability.sort((a, b) => a.Year - b.Year);
        affordabilityIndex.value = processedAffordability;

        const groupedByArea = d3.group(rawChartData, (d) => d["Planning Area"]);

        const processedYearMedians = [];
        const processedYearCounts = [];
        const processedYearFlatTypeMedians = [];
        const processedBoxplot = [];

        const tierClassifier = (distance) => {
            const d = parseFloat(distance);
            if (isNaN(d)) return null;
            if (d <= 1000) return "Within 1km";
            if (d <= 2000) return "Within 2km";
            return "More than 2km";
        };
        const hsdMap = new Map();

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

        const groupedByYearsRemaining = d3.group(
            rawChartData,
            (d) => +d["Years Remaining"]
        );

        const processedLeaseTrend = Array.from(
            groupedByYearsRemaining,
            ([yearsRemaining, records]) => {
                const medianPrice = d3.median(records, (d) =>
                    parseFloat(d["Resale Price Adj 2024"])
                );
                return {
                    "Years Remaining": yearsRemaining,
                    "Resale Price Adj 2024": medianPrice,
                };
            }
        ).sort((a, b) => b["Years Remaining"] - a["Years Remaining"]);

        leaseTrend.value = processedLeaseTrend;
        processedHsdTrend.sort((a, b) => a.year - b.year);
        hsdResaleTrend.value = processedHsdTrend;

        processedYearMedians.sort((a, b) => a.Year - b.Year);
        processedYearFlatTypeMedians.sort((a, b) => a.Year - b.Year);

        yearMedians.value = processedYearMedians;
        yearCounts.value = processedYearCounts;
        yearFlatTypeMedians.value = processedYearFlatTypeMedians;
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
        sampledChartData,
        yearMedians,
        yearCounts,
        yearFlatTypeMedians,
        pricePerSqmByPlanningArea,
        ethnicDistribution,
        affordabilityIndex,
        hsdResaleTrend,
        borderFlats,
        leaseTrend,
        ageAndDwellingTypeData,
        isDataLoaded,
        medianMonthlyIncome,
        amenitiesByPlanningArea,
        loadData,
        preprocessData,
        ensureDataLoaded,
    };
});

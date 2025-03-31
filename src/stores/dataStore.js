import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import * as d3 from 'd3';

export const useDataStore = defineStore('dataStore', () => {
  const chartData = ref(null);
  const yearMedians = ref([]);
  const yearCounts = ref([]);
  const yearFlatTypeMedians = ref([]);
  const storeyPriceScatter = ref([]);
  const pricePerSqmByPlanningArea = ref([]);
  
  const isDataLoaded = computed(() => chartData.value !== null);
  const isDataReady = computed(() => yearMedians.value.length > 0);

  async function loadData() {
    if (isDataLoaded.value) return;

    try {
      const data = await Promise.all([
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1990.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1991.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1992.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1993.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1994.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1995.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1996.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1997.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1998.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_1999.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2000.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2001.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2002.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2003.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2004.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2005.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2006.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2007.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2008.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2009.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2010.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2011.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2012.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2013.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2014.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2015.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2016.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2017.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2018.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2019.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2020.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2021.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2022.csv"),
        d3.csv("data/resale_prices_cleaned/HDBPriceWithSubzone_2023.csv"),
      ]);

      chartData.value = data.flat();

      preprocessData();
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  function preprocessData() {
    if (!chartData.value) return;

    const groupedByYear = d3.group(chartData.value, (d) => d.Year);
    const groupedByArea = d3.group(chartData.value, (d) => d["Planning Area"]);

    const processedYearMedians = [];
    const processedYearCounts = [];
    const processedYearFlatTypeMedians = [];
    const processedStoreyPriceScatter = [];
    const processedBoxplot = [];

    groupedByYear.forEach((values, year) => {
      const median = d3.median(values, (d) => parseFloat(d["Resale Price"]));
      processedYearMedians.push({
        Year: parseInt(year),
        median: median
      });

      processedYearCounts.push({
        Year: parseInt(year),
        count: values.length
      });

      const groupedByFlatType = d3.group(values, (d) => d["Flat Type"]);
      groupedByFlatType.forEach((entries, flatType) => {
        const flatMedian = d3.median(entries, (d) => parseFloat(d["Resale Price"]));
        processedYearFlatTypeMedians.push({
          Year: parseInt(year),
          FlatType: flatType,
          median: flatMedian
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
    chartData,
    yearMedians,
    yearCounts,
    yearFlatTypeMedians,
    pricePerSqmByPlanningArea,
    // storeyPriceScatter,
    isDataLoaded,
    isDataReady,
    loadData,
    preprocessData,
    ensureDataLoaded,
  };
});

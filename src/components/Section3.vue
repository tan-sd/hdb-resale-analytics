<template>
    <section class="w-full min-h-screen py-20 bg-white">
        <div data-section3="before-steps" class="h-[1vh]"></div>
        <div
            class="w-full px-6 mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12"
        >
            <div class="w-full max-w-lg mx-auto">
                <div
                    class="xl:sticky xl:top-64 fixed bottom-3 left-0 right-0 z-10 px-4 xl:px-0"
                    :class="['transition-opacity duration-300', { 'opacity-0 pointer-events-none': !showBox, 'opacity-100': showBox }]"
                >
                    <div
                        class="border rounded-lg backdrop-blur-[6.5px] p-6 space-y-6 bg-white relative overflow-hidden shadow-md"
                    >
                        <h2
                            class="text-sm sm:text-base font-bold uppercase tracking-tight mb-3 section-title"
                        >
                            Factors
                        </h2>

                        <div class="space-y-3">
                            <p class="flex items-center gap-2 uppercase text-xs md:text-sm font-semibold tracking-wide">
                                <span
                                    class="text-white font-bold w-7 h-7 flex items-center justify-center rounded-full text-sm"
                                    style="background-color: hsl(353 75% 53%)"
                                >
                                    {{ currentStep.number }}
                                </span>
                                {{ currentStep.title }}
                            </p>
                            <div class="space-y-4 text-xs md:text-sm leading-relaxed">
                                <p
                                    v-for="(para, idx) in currentStep.description"
                                    :key="idx"
                                    v-html = "para"
                                >
                                </p>
                            </div>

                            <div
                                class="absolute bottom-0 left-0 w-full h-2 overflow-hidden rounded-b-[calc(1rem-1px)] bg-gray-200"
                            >
                                <div
                                    class="h-full"
                                    style="background-color: hsl(353 75% 53%)"
                                    :style="{ width: progress + '%' }"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
            class="flex-1 relative"
            :style="{ height: `${steps.length * 115}vh` }"
            >
                <div class="sticky top-12 xl:top-28 w-full flex justify-center">
                    <div class="relative w-full h-[500px] max-w-[1000px]">
                    <ScatterPlotStoreyGroup
                        ref="storeyScatterChartRef"
                        v-show="currentStepIndex === 0"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-100"
                    />

                    <!-- <LineChartStoreyGroup
                        ref="storeyLineChartRef"
                        v-show="currentStepIndex === 1 || currentStepIndex === 2"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                    /> -->

                    <LineChartFlatType
                        ref="flatTypeLineChartRef"
                        v-show="currentStepIndex === 1"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                    />

                    <ScatterPlotFlatType
                        ref="flatTypeScatterChartRef"
                        v-show="currentStepIndex === 2"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                    />

                    <BoxPlotPricePerSqm
                        ref="boxPlotPricePerSqmChartRef"
                        v-show="currentStepIndex === 3 || currentStepIndex === 4"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                    />

                    <LineChartHSD
                        ref="lineChartHSDRef"
                        v-show="currentStepIndex === 5"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                    />

                    <BoxPlotElectoralBoundaries
                        ref="boxPlotElectoralBoundariesChartRef"
                        v-show="currentStepIndex === 6"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                    />
                    
                    <LineChartLeaseRemaining
                        ref="LineChartLeaseRemainingRef"
                        v-show="currentStepIndex === 7"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                    />
                    </div>
                </div>

                <div class="absolute inset-0 pointer-events-none">
                    <div class="space-y-[1vh]">
                    <div
                        v-for="(step, index) in steps"
                        :key="index"
                        :data-section3="index"
                        class="h-[99vh]"
                    ></div>
                    </div>

                    <div data-section3="after-steps" class="h-[1vh]"></div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import LineChartFlatType from './LineChartFlatType.vue';
import LineChartMedianIncomeAndMedianResale from './LineChartMedianIncomeAndMedianResale.vue';
import ScatterPlotStoreyGroup from './ScatterPlotStoreyGroup.vue';
import LineChartStoreyGroup from './LineChartStoreyGroup.vue';
import ScatterPlotFlatType from './ScatterPlotFlatType.vue';
import BoxPlotPricePerSqm from './BoxPlotPricePerSqm.vue';
import LineChartHSD from './LineChartHSD.vue';
import BoxPlotElectoralBoundaries from './BoxPlotElectoralBoundaries.vue';
import LineChartLeaseRemaining from './LineChartLeaseRemaining.vue';
import { ref, computed, onMounted, watch, onBeforeUnmount, watchEffect } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const currentStepIndex = ref(0);
const progress = ref(0);
const triggers = ref([]);
const showBox = ref(true);
const isPastLastSection = ref(false);
const storeyScatterChartRef = ref(null);
const storeyLineChartRef = ref(null);
const flatTypeLineChartRef = ref(null);
const flatTypeScatterChartRef = ref(null);
const boxPlotPricePerSqmChartRef = ref(null);
const lineChartHSDRef = ref(null);
const boxPlotElectoralBoundariesChartRef = ref(null);
const LineChartLeaseRemainingRef = ref(null);
const hasDrawnLineChart = ref(false);
const isAfterSteps = ref(false);
const isBeforeSteps = ref(true);

const steps = [
    {
        number: 1,
        title: "Storey Levels",
        description: [
            "The graph shows a clear positive relationship between <span class=\"font-semibold\">storey level</span> and HDB resale prices: as floor height increases, so does the average price per square meter. Flats on lower floors (0–5 storeys) average just over $4,000 per sqm, while those on the highest floors (45–51 storeys) exceed $12,000. Notable price jumps occur between 20–25 and 25–30 storeys, and again between 30–35 and 35–40, suggesting that <span class=\"font-semibold\">higher floors command a premium</span>.",
            
            "This trend reflects buyer preferences for <span class=\"font-semibold\">better views</span>, ventilation, and privacy (URA, 2020). Top-floor units may include <span class=\"font-semibold\">premium features</span> or layouts. Over time, <span class=\"font-semibold\">high-rise living</span> has become more desirable due to lifestyle shifts and perceived prestige (HDB, 2021). However, price growth tapers off beyond the 45th storey, suggesting <span class=\"font-semibold\">diminishing value</span> at extreme heights. Overall, storey level acts as a strong proxy for market demand.",

            "Note: The smaller number of transactions at higher floors may result in skewed price values, especially for upper storey bands."
        ],

        years: [
            1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
            2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
            2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
            2023,
        ],
    },


    // {
    //     number: 1,
    //     title: "Storey Levels",
    //     description: [
    //         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
    //         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
    //     ],
    //     years: [
    //         1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
    //         2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
    //         2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
    //         2023,
    //     ],
    // },
    // {
    //     number: 1,
    //     title: "Storey Levels",
    //     description: [
    //         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
    //         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
    //     ],
    //     years: [
    //         1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
    //         2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
    //         2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
    //         2023,
    //     ],
    // },
    {
        number: 2,
        title: "Flat Types & Sizes",
        description: [
        "The graph shows that across all flat types, median HDB resale prices have generally increased from 1990 to 2023, with larger flats like <span class=\"font-semibold\">Executive</span> and <span class=\"font-semibold\">Multi-Generation</span> consistently commanding higher prices. After a sharp rise in the early 1990s, prices dipped post-1997 due to the Asian Financial Crisis, then recovered around 2007. From 2013 onward, prices plateaued due to cooling measures such as the <span class=\"font-semibold\">MSR</span> and <span class=\"font-semibold\">TDSR</span>.",

        "From 2020, prices surged — especially for <span class=\"font-semibold\">Multi-Generation</span> flats. This spike likely reflects increased demand for <span class=\"font-semibold\">larger homes</span> during COVID-19, as families sought space for work, caregiving, and co-living. A study by IPS highlights that the pandemic renewed appreciation for <span class=\"font-semibold\">intergenerational support</span> and <span class=\"font-semibold\">living together</span>."
        ],
        years: [1990, 1991, 1992, 1993, 1994],
    },
    {
        number: 2,
        title: "Flat Types & Sizes",
        description: [
            "The graph shows that across all flat types, median HDB resale prices have generally increased from 1990 to 2023, with larger flats like <span class=\"font-semibold\">Executive</span> and <span class=\"font-semibold\">Multi-Generation</span> consistently commanding higher prices. After a sharp rise in the early 1990s, prices dipped post-1997 due to the Asian Financial Crisis, then recovered around 2007. From 2013 onward, prices plateaued due to cooling measures such as the <span class=\"font-semibold\">MSR</span> and <span class=\"font-semibold\">TDSR</span>.",

            "From 2020, prices surged — especially for <span class=\"font-semibold\">Multi-Generation</span> flats. This spike likely reflects increased demand for <span class=\"font-semibold\">larger homes</span> during COVID-19, as families sought space for work, caregiving, and co-living. A study by IPS highlights that the pandemic renewed appreciation for <span class=\"font-semibold\">intergenerational support</span> and <span class=\"font-semibold\">living together</span>."
        ],
        years: [1990, 1991, 1992, 1993, 1994],
    },
    {
        number: 3,
        title: "Price per sqm by Planning Area",
        description: [
        "The boxplots show the <span class=\"font-semibold\">price per sqm</span> of HDB resale flats across different planning areas in Singapore. In the unsorted version, areas are listed alphabetically, while the sorted version helps visualize clear price gradients. Areas like <span class=\"font-semibold\">Downtown Core</span>, <span class=\"font-semibold\">Outram</span>, and <span class=\"font-semibold\">Punggol</span> exhibit the highest median prices, while <span class=\"font-semibold\">Lim Chu Kang</span> lies at the lowest end.",

        "These pricing differences are primarily driven by <span class=\"font-semibold\">location desirability</span> and <span class=\"font-semibold\">accessibility</span>. Flats located in or near the city center — like Downtown Core or Outram — command higher prices due to proximity to commercial districts, MRT stations, and lifestyle amenities. Newer towns such as Punggol also attract premium prices due to integrated town planning, waterfront developments, and Smart Town infrastructure.",

        "Meanwhile, areas with lower prices — like <span class=\"font-semibold\">Sembawang</span>, <span class=\"font-semibold\">Jurong West</span>, or <span class=\"font-semibold\">Lim Chu Kang</span> — tend to be further from the city center, have fewer transport connections, or are less developed in terms of amenities. In some cases, prices are lower due to an older flat stock or lower buyer demand.",

        "Smaller planning areas or those with fewer residential blocks, such as <span class=\"font-semibold\">Lim Chu Kang</span>, may also show skewed data due to a <span class=\"font-semibold\">limited number of transactions</span>. Outliers from a few unique sales — such as larger flats or rare units — can cause <span class=\"font-semibold\">disproportionate price variations</span> in these regions."
        ],
        years: [1994, 1995, 1996],
    },
    {
        number: 3,
        title: "Price per sqm by Planning Area",
        description: [
        "The boxplots show the <span class=\"font-semibold\">price per sqm</span> of HDB resale flats across different planning areas in Singapore. In the unsorted version, areas are listed alphabetically, while the sorted version helps visualize clear price gradients. Areas like <span class=\"font-semibold\">Downtown Core</span>, <span class=\"font-semibold\">Outram</span>, and <span class=\"font-semibold\">Punggol</span> exhibit the highest median prices, while <span class=\"font-semibold\">Lim Chu Kang</span> lies at the lowest end.",

        "These pricing differences are primarily driven by <span class=\"font-semibold\">location desirability</span> and <span class=\"font-semibold\">accessibility</span>. Flats located in or near the city center — like Downtown Core or Outram — command higher prices due to proximity to commercial districts, MRT stations, and lifestyle amenities. Newer towns such as Punggol also attract premium prices due to integrated town planning, waterfront developments, and Smart Town infrastructure.",

        "Meanwhile, areas with lower prices — like <span class=\"font-semibold\">Sembawang</span>, <span class=\"font-semibold\">Jurong West</span>, or <span class=\"font-semibold\">Lim Chu Kang</span> — tend to be further from the city center, have fewer transport connections, or are less developed in terms of amenities. In some cases, prices are lower due to an older flat stock or lower buyer demand.",

        "Smaller planning areas or those with fewer residential blocks, such as <span class=\"font-semibold\">Lim Chu Kang</span>, may also show skewed data due to a <span class=\"font-semibold\">limited number of transactions</span>. Outliers from a few unique sales — such as larger flats or rare units — can cause <span class=\"font-semibold\">disproportionate price variations</span> in these regions."
        ],
        years: [1994, 1995, 1996],
    },
    {
        number: 4,
        title: "Amenities & Accessibility",
        description: [
            "This chart illustrates how proximity to primary schools—shaped by Singapore’s <span class=\"font-semibold\">Home-School Distance (HSD) policy</span>—significantly influences <span class=\"font-semibold\">HDB resale prices</span>. Under the HSD framework, children living <span class=\"font-semibold\">within 1km</span> of a school are given priority during the <span class=\"font-semibold\">Primary 1 admission exercise</span>, with those living <span class=\"font-semibold\">within 2km</span> receiving second-tier priority.",
            "As a result, homes closer to <span class=\"font-semibold\">popular schools</span> are in higher demand, which translates into <span class=\"font-semibold\">higher resale values</span>. The chart shows that since the <span class=\"font-semibold\">2009 awareness spike</span> and further policy refinements in <span class=\"font-semibold\">2014</span> and <span class=\"font-semibold\">2021</span>, the <span class=\"font-semibold\">price gap between tiers has widened</span>. This reflects growing competition among parents for <span class=\"font-semibold\">limited school places</span>, making HSD a critical factor for <span class=\"font-semibold\">young families</span> and a driver of <span class=\"font-semibold\">long-term property value</span>.",
        ],
        years: [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006],
    },
    {
        number: 5,
        title: "Electoral Boundaries",
        description: [
            "The chart shows <span class=\"font-semibold\">resale prices (2024 adjusted)</span> of HDB flats within 500 meters of political boundaries between <span class=\"font-semibold\">PAP</span>, <span class=\"font-semibold\">WP</span>, and <span class=\"font-semibold\">SDA</span> constituencies across five electoral periods. Overall, <span class=\"font-semibold\">PAP-adjacent areas</span> consistently show higher median resale prices compared to WP or SDA areas from 2006 to 2023.",

            "This may reflect historical differences in town development. PAP wards tend to include more centrally located or mature estates with better infrastructure, amenities, and transport access — all factors known to increase HDB resale value (URA, 2020: https://www.ura.gov.sg/Corporate/Guidelines/Urban-Design/Planning-for-Liveability).",

            "However, WP areas have shown a <span class=\"font-semibold\">gradual closing of the gap</span> in recent periods, especially post-2011 when WP gained Aljunied GRC. Government-funded programmes like the Home Improvement Programme (HIP) and Neighbourhood Renewal Programme (NRP) have been extended to opposition wards, ensuring equitable upgrades.",

            "The narrowing price gap from 2015 onward may also reflect the <span class=\"font-semibold\">growing acceptance and confidence in opposition-led wards</span> among buyers. Still, resale price differences are likely influenced by a combination of political history, estate maturity, flat types, and regional demand — rather than party alignment alone."
        ],
        years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013],
    },
    {
        number: 6,
        title: "Years Reamining on Lease",
        description: [
            "Flats with nearly full leases (close to <span class=\"font-semibold\">99 years remaining</span>) command the <span class=\"font-semibold\">highest resale prices</span>, reflecting the premium for <span class=\"font-semibold\">newer flats</span> like recently <span class=\"font-semibold\">MOP-ed (Minimum Occupation Period) BTO flats</span>. These flats are highly sought after due to their <span class=\"font-semibold\">modern amenities</span> and <span class=\"font-semibold\">long lease durations</span>.",
            "Flats with shorter leases (less than <span class=\"font-semibold\">50 years remaining</span>) face reduced demand due to <span class=\"font-semibold\">CPF and Loan Eligibility Restrictions</span>, which limit financing options and raise concerns about lease expiry.",
            "The <span class=\"font-semibold\">Lease Decay Effect</span> describes how a flat’s resale value <span class=\"font-semibold\">gradually declines</span> as its remaining lease decreases, especially beyond key thresholds."
        ],
        years: [
            1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023],
    },
    {
        number: 7,
        title: "Demographics (Age)",
        description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed."
        ],
        years: [2007, 2008, 2009, 2010, 2011, 2012, 2013], // edit this
    },
];

const currentStep = computed(() => steps[currentStepIndex.value]);

onMounted(() => {
  steps.forEach((step, index) => {
    const triggerElement = document.querySelector(`[data-section3="${index}"]`);

    if (triggerElement) {
      const trigger = ScrollTrigger.create({
        trigger: triggerElement,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          currentStepIndex.value = index;
        },
        onEnterBack: () => {
          currentStepIndex.value = index;
        },
        onUpdate: (self) => {
          progress.value = Math.round(self.progress * 100);
        }
      });

      triggers.value.push(trigger);
    }
  });

  const afterStepsTrigger = document.querySelector('[data-section3="after-steps"]');
  if (afterStepsTrigger) {
    const trigger = ScrollTrigger.create({
      trigger: afterStepsTrigger,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        isAfterSteps.value = true;
      },
      onEnterBack: () => {
        isAfterSteps.value = false;
      }
    });
    triggers.value.push(trigger);
  }
  
  const beforeStepsTrigger = document.querySelector('[data-section3="before-steps"]');
  if (beforeStepsTrigger) {
    const trigger = ScrollTrigger.create({
        trigger: beforeStepsTrigger,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            isBeforeSteps.value = false;
        },
        onEnterBack: () => {
            isBeforeSteps.value = true;
        }
    });
    triggers.value.push(trigger);
  }

  ScrollTrigger.refresh();
});

watchEffect(() => {
    showBox.value = !isBeforeSteps.value && !isAfterSteps.value;
});

onBeforeUnmount(() => {
    triggers.value.forEach((trigger) => trigger?.kill());
    triggers.value = [];
});

watch(currentStepIndex, (newIndex) => {
  const showScatter = newIndex === 0;
//   const showLineChart = newIndex === 1 || newIndex === 2;
  const showFlatCharts = newIndex === 1;
  const showScatterFlat = newIndex === 2;
  const showBoxPlot = newIndex === 3 || newIndex === 4;
  const showHSD = newIndex === 5;
  const showBoxPlotElectoral = newIndex === 6;
  const showLease = newIndex === 7;

  gsap.to(storeyScatterChartRef.value?.$el, {
    opacity: showScatter ? 1 : 0,
    duration: 0.3,
    ease: 'power2.out',
  });

//   gsap.to(storeyLineChartRef.value?.$el, {
//     opacity: showLineChart ? 1 : 0,
//     duration: 0.3,
//     ease: 'power2.out',
//     onStart: () => {
//       if (showLineChart && !hasDrawnLineChart.value && typeof storeyLineChartRef.value?.resizeAndRedraw === 'function') {
//         storeyLineChartRef.value.resizeAndRedraw();
//         hasDrawnLineChart.value = true;
//       }

//       if (newIndex === 2) {
//         storeyLineChartRef.value?.highlightLines(["Very Low", "High"]);
//       } else {
//         storeyLineChartRef.value?.highlightLines([]);
//       }
//     }
//   });

  gsap.to(flatTypeLineChartRef.value?.$el, {
    opacity: showFlatCharts ? 1 : 0,
    duration: 0.3,
    ease: 'power2.out',
    onStart: () => {
      if (typeof flatTypeLineChartRef.value?.resizeAndRedraw === 'function') {
        flatTypeLineChartRef.value.resizeAndRedraw();
      }
    }
  });

  gsap.to(flatTypeScatterChartRef.value?.$el, {
    opacity: showScatterFlat ? 1 : 0,
    duration: 0.3,
    ease: 'power2.out',
    onStart: () => {
        if (showScatterFlat && typeof flatTypeScatterChartRef.value?.handleResize === 'function') {
            flatTypeScatterChartRef.value.handleResize();
            }
        }
    });

    gsap.to(boxPlotPricePerSqmChartRef.value?.$el, {
        opacity: showBoxPlot ? 1 : 0,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
            if (showBoxPlot && typeof boxPlotPricePerSqmChartRef.value?.handleResize === 'function') {
                boxPlotPricePerSqmChartRef.value.resizeAndRedraw();
            }

            if (newIndex === 3 && typeof boxPlotPricePerSqmChartRef.value?.sortToOriginalOrder === 'function') {
                boxPlotPricePerSqmChartRef.value.sortToOriginalOrder();
            }

            if (newIndex === 4 && typeof boxPlotPricePerSqmChartRef.value?.sortByMedianDescending === 'function') {
                boxPlotPricePerSqmChartRef.value.sortByMedianDescending();
            }
        }
    });

    gsap.to(lineChartHSDRef.value?.$el, {
        opacity: showHSD ? 1 : 0,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
            if (showHSD && typeof lineChartHSDRef.value?.resizeAndRedraw === 'function') {
            lineChartHSDRef.value.resizeAndRedraw();
            }
        }
    });

    gsap.to(boxPlotElectoralBoundariesChartRef.value?.$el, {
        opacity: showBoxPlotElectoral ? 1 : 0,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
            if (showBoxPlotElectoral && typeof boxPlotElectoralBoundariesChartRef.value?.resizeAndRedraw === 'function') {
                boxPlotElectoralBoundariesChartRef.value.resizeAndRedraw();
            }
        }
    });

    gsap.to(LineChartLeaseRemainingRef.value?.$el, {
        opacity: showLease ? 1 : 0,
        duration: 0.3,
        ease: 'power2.out',
        onStart: () => {
            if (showLease && typeof LineChartLeaseRemainingRef.value?.resizeAndRedraw === 'function') {
                LineChartLeaseRemainingRef.value.resizeAndRedraw();
            }
        }
    });
});
</script>
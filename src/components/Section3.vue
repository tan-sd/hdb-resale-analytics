<template>
    <section class="pt-40 w-full min-h-screen py-20 bg-white">
        <div data-section3="before-steps" class="h-[1vh]"></div>
        <div class="relative">
            <div
                class="w-full px-6 mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 min-h-screen"
            >
                <div class="w-full max-w-lg mx-auto">
                    <div
                        class="lg:sticky lg:top-1/2 lg:transform lg:-translate-y-1/2 fixed lg:static bottom-4 left-1/2 -translate-x-1/2 lg:translate-x-0 z-20"
                        :class="[
                            'transition-opacity duration-300',
                            {
                                'opacity-0 pointer-events-none': !showBox,
                                'opacity-100': showBox,
                            },
                        ]"
                    >
                        <div
                            class="border rounded-t-xl lg:rounded-lg backdrop-blur-[6.5px] p-6 space-y-6 bg-white relative overflow-hidden shadow-md w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] lg:w-auto h-[30vh] lg:h-auto"
                        >
                            <h2
                                class="text-sm sm:text-base font-bold uppercase tracking-tight mb-3 section-title"
                            >
                                Factors
                            </h2>
                            <div
                                ref="descScrollRef"
                                class="overflow-y-auto h-full pr-1 lg:pb-0 pb-10"
                            >
                                <div class="space-y-3">
                                    <p
                                        class="flex items-center gap-2 uppercase text-xs md:text-sm font-semibold tracking-wide"
                                    >
                                        <span
                                            class="text-white font-bold w-7 h-7 flex items-center justify-center rounded-full text-sm"
                                            style="
                                                background-color: hsl(
                                                    353 75% 53%
                                                );
                                            "
                                        >
                                            {{ currentStep.number }}
                                        </span>
                                        {{ currentStep.title }}
                                    </p>
                                    <div
                                        class="space-y-4 text-xs md:text-sm leading-relaxed"
                                    >
                                        <p
                                            v-for="(
                                                para, idx
                                            ) in currentStep.description"
                                            :key="idx"
                                            v-html="para"
                                        ></p>
                                    </div>

                                    <div
                                        class="absolute bottom-0 left-0 w-full h-2 overflow-hidden rounded-b-[calc(1rem-1px)] bg-gray-200"
                                    >
                                        <div
                                            class="h-full"
                                            style="
                                                background-color: hsl(
                                                    353 75% 53%
                                                );
                                            "
                                            :style="{ width: progress + '%' }"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="flex-1 relative"
                    :style="{ height: `${steps.length * 115}vh` }"
                >
                    <div
                        class="sticky top-0 w-full h-screen flex items-start justify-center lg:items-center"
                    >
                        <div
                            class="flex flex-col gap-5 lg:gap-10 xl:gap-12 items-center w-full max-w-3xl px-4"
                        >
                            <div
                                class="w-full flex justify-center h-[50vh] lg:h-screen mt-6 lg:mt-0"
                            >
                                <ScatterPlotStoreyGroup
                                    ref="storeyScatterChartRef"
                                    v-show="currentStepIndex === 0"
                                    class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-100"
                                />
                            </div>

                            <div
                                class="w-full flex justify-center mt-6 lg:mt-0"
                            >
                                <LineChartFlatType
                                    ref="flatTypeLineChartRef"
                                    v-show="
                                        currentStepIndex === 1 ||
                                        currentStepIndex === 2
                                    "
                                    class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                                    :highlightYears="
                                        currentStepIndex === 2
                                            ? [2020, 2021, 2022, 2023]
                                            : []
                                    "
                                    :highlightedFlatTypes="
                                        currentStepIndex === 2
                                            ? ['EXECUTIVE', 'MULTI-GENERATION']
                                            : []
                                    "
                                    :shouldHighlight="currentStepIndex === 2"
                                />
                            </div>

                            <div
                                class="w-full flex justify-center h-[50vh] lg:h-screen mt-6 lg:mt-0"
                            >
                                <ScatterPlotFlatType
                                    ref="flatTypeScatterChartRef"
                                    v-show="currentStepIndex === 3"
                                    class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                                />
                            </div>

                            <div
                                class="w-full flex justify-center h-[50vh] lg:h-screen mt-6 lg:mt-0"
                            >
                                <BoxPlotPricePerSqm
                                    ref="boxPlotPricePerSqmChartRef"
                                    v-show="
                                        currentStepIndex === 4 ||
                                        currentStepIndex === 5
                                    "
                                    class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                                />
                            </div>

                            <div
                                class="w-full flex justify-center h-[50vh] lg:h-screen mt-6 lg:mt-0"
                            >
                                <LineChartHSD
                                    ref="lineChartHSDRef"
                                    v-show="currentStepIndex === 6"
                                    class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                                />
                            </div>

                            <div
                                class="w-full flex justify-center h-[50vh] lg:h-screen mt-6 lg:mt-0"
                            >
                                <BoxPlotElectoralBoundaries
                                    ref="boxPlotElectoralBoundariesChartRef"
                                    v-show="currentStepIndex === 7"
                                    class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                                />
                            </div>

                            <div
                                class="w-full flex justify-center h-[50vh] lg:h-screen mt-6 lg:mt-0"
                            >
                                <LineChartLeaseRemaining
                                    ref="LineChartLeaseRemainingRef"
                                    v-show="currentStepIndex === 8"
                                    class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                                />
                            </div>
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
        </div>
    </section>
</template>

<script setup>
import LineChartFlatType from "./LineChartFlatType.vue";
import ScatterPlotStoreyGroup from "./ScatterPlotStoreyGroup.vue";
import ScatterPlotFlatType from "./ScatterPlotFlatType.vue";
import BoxPlotPricePerSqm from "./BoxPlotPricePerSqm.vue";
import LineChartHSD from "./LineChartHSD.vue";
import BoxPlotElectoralBoundaries from "./BoxPlotElectoralBoundaries.vue";
import LineChartLeaseRemaining from "./LineChartLeaseRemaining.vue";
import {
    ref,
    computed,
    onMounted,
    watch,
    onBeforeUnmount,
    watchEffect,
} from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const currentStepIndex = ref(0);
const progress = ref(0);
const triggers = ref([]);
const showBox = ref(true);
const storeyScatterChartRef = ref(null);
const flatTypeLineChartRef = ref(null);
const flatTypeScatterChartRef = ref(null);
const boxPlotPricePerSqmChartRef = ref(null);
const lineChartHSDRef = ref(null);
const boxPlotElectoralBoundariesChartRef = ref(null);
const LineChartLeaseRemainingRef = ref(null);
const isAfterSteps = ref(false);
const isBeforeSteps = ref(true);
const descScrollRef = ref(null);

const steps = [
    {
        number: 1,
        title: "Storey Levels",
        description: [
            'The graph shows a clear positive relationship between <span class="font-semibold">storey level</span> and HDB resale prices: as floor height increases, so does the average price per square meter. Flats on lower floors (0–5 storeys) average just over $4,000 per sqm, while those on the highest floors (45–51 storeys) exceed $12,000. Notable price jumps occur between 20–25 and 25–30 storeys, and again between 30–35 and 35–40, suggesting that <span class="font-semibold">higher floors command a premium</span>.',

            'This trend reflects buyer preferences for <span class="font-semibold">better views</span>, ventilation, and privacy (URA, 2020). Top-floor units may include <span class="font-semibold">premium features</span> or layouts. Over time, <span class="font-semibold">high-rise living</span> has become more desirable due to lifestyle shifts and perceived prestige (HDB, 2021). However, price growth tapers off beyond the 45th storey, suggesting <span class="font-semibold">diminishing value</span> at extreme heights. Overall, storey level acts as a strong proxy for market demand.',

            "Note: The smaller number of transactions at higher floors may result in skewed price values, especially for upper storey bands.",
        ],

        years: [
            1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
            2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
            2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
            2023,
        ],
    },
    {
        number: 2,
        title: "Flat Types & Sizes",
        description: [
            'The graph shows that across all flat types, median HDB resale prices have generally increased from 1990 to 2023, with larger flats like <span class="font-semibold">Executive</span> and <span class="font-semibold">Multi-Generation</span> consistently commanding higher prices. After a sharp rise in the early 1990s, prices dipped post-1997 due to the Asian Financial Crisis, then recovered around 2007. From 2013 onward, prices plateaued due to cooling measures such as the <span class="font-semibold">MSR</span> and <span class="font-semibold">TDSR</span>.'
        ],

        years: [1990, 1991, 1992, 1993, 1994],
    },
    {
        number: 2,
        title: "Flat Types & Sizes",
        description: [
            'From 2020, prices surged — especially for <span class="font-semibold">Multi-Generation</span> flats. This spike likely reflects increased demand for <span class="font-semibold">larger homes</span> during COVID-19, as families sought space for work, caregiving, and co-living. A study by IPS highlights that the pandemic renewed appreciation for <span class="font-semibold">intergenerational support</span> and <span class="font-semibold">living together</span>.',
        ],
        years: [2020, 2021, 2022, 2023],
    },
    {
        number: 2,
        title: "Flat Types & Sizes",
        description: [
            'The scatterplot illustrates the relationship between <span class="font-semibold">floor area</span> and <span class="font-semibold">HDB resale price</span>, clearly showing that larger flats tend to fetch higher prices. Each flat type clusters by its typical floor size, with 1- to 5-room flats, Executive, and Multi-Generation units forming distinct vertical groupings.',

            'Despite this positive correlation, the wide spread of prices within each cluster suggests that other factors — such as <span class="font-semibold">location</span>, <span class="font-semibold">flat age</span>, and <span class="font-semibold">renovation status</span> — also play a significant role in price determination. Some smaller flats are priced similarly to larger ones due to such variables.',

            'The trendline confirms the general upward slope: as floor area increases, so does the expected resale price. However, the plot also reveals price overlap across flat types, highlighting <span class="font-semibold">market heterogeneity</span> even among similar-sized homes.'
        ],
        years: [1990, 1991, 1992, 1993, 1994],
    },
    {
        number: 3,
        title: "Price per sqm by Planning Area",
        description: [
        "This boxplot shows <span class=\"font-semibold\">price per sqm</span> of resale flats across planning areas in <span class=\"font-semibold\">alphabetical order</span>. While this view gives an overview of all regions, price trends are less immediately visible.",
        "You can still observe key differences: areas like <span class=\"font-semibold\">Downtown Core</span> and <span class=\"font-semibold\">Outram</span> stand out with high median prices, while <span class=\"font-semibold\">Lim Chu Kang</span> appears at the lower end.",
        "Some areas — such as <span class=\"font-semibold\">Lim Chu Kang</span> — may show wider spreads due to <span class=\"font-semibold\">fewer transactions</span> or <span class=\"font-semibold\">outlier sales</span>, like rare flat types or unusually large units."
        ],
        years: [1994, 1995, 1996],
    },
    {
        number: 3,
        title: "Price per sqm by Planning Area",
        description: [
        "This version sorts planning areas by <span class=\"font-semibold\">median price</span>, revealing a clear price gradient across Singapore.",
        "<span class=\"font-semibold\">Central locations</span> like <span class=\"font-semibold\">Downtown Core</span> and <span class=\"font-semibold\">Outram</span> command the highest prices due to proximity to the <span class=\"font-semibold\">CBD</span>, <span class=\"font-semibold\">MRT stations</span>, and key amenities.",
        "<span class=\"font-semibold\">Newer towns</span> like <span class=\"font-semibold\">Punggol</span> also show high prices, reflecting investments in <span class=\"font-semibold\">Smart Town features</span> and waterfront living.",
        "In contrast, areas like <span class=\"font-semibold\">Sembawang</span> and <span class=\"font-semibold\">Jurong West</span> have lower prices, often due to <span class=\"font-semibold\">older flats</span>, <span class=\"font-semibold\">distance from the city</span>, or fewer transport links."
        ],
        years: [1994, 1995, 1996],
    },
    {
        number: 4,
        title: "Amenities & Accessibility",
        description: [
            'This chart illustrates how proximity to primary schools—shaped by Singapore’s <span class="font-semibold">Home-School Distance (HSD) policy</span>—significantly influences <span class="font-semibold">HDB resale prices</span>. Under the HSD framework, children living <span class="font-semibold">within 1km</span> of a school are given priority during the <span class="font-semibold">Primary 1 admission exercise</span>, with those living <span class="font-semibold">within 2km</span> receiving second-tier priority.',
            'As a result, homes closer to <span class="font-semibold">popular schools</span> are in higher demand, which translates into <span class="font-semibold">higher resale values</span>. The chart shows that since the <span class="font-semibold">2009 awareness spike</span> and further policy refinements in <span class="font-semibold">2014</span> and <span class="font-semibold">2021</span>, the <span class="font-semibold">price gap between tiers has widened</span>. This reflects growing competition among parents for <span class="font-semibold">limited school places</span>, making HSD a critical factor for <span class="font-semibold">young families</span> and a driver of <span class="font-semibold">long-term property value</span>.',
        ],
        years: [
            1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
            2001, 2002, 2003, 2004, 2005, 2006,
        ],
    },
    {
        number: 5,
        title: "Electoral Boundaries",
        description: [
            'This chart shows <span class="font-semibold">2024-adjusted resale prices</span> of HDB flats located within 500m of boundaries between <span class="font-semibold">PAP</span>, <span class="font-semibold">WP</span>, and <span class="font-semibold">SDA</span> constituencies across five electoral periods.',
            
            '<span class="font-semibold">PAP-adjacent areas</span> consistently show higher median prices, especially before 2015. This may reflect more <span class="font-semibold">mature estates</span>, better <span class="font-semibold">infrastructure</span>, and <span class="font-semibold">central locations</span> often found in PAP wards.',
            
            'Since 2011, <span class="font-semibold">WP areas</span> have seen a gradual price rise, narrowing the gap. Policies like the <span class="font-semibold">HIP</span> and <span class="font-semibold">NRP</span> being extended to opposition wards likely helped improve amenities and buyer confidence.',
            
            'By 2020–2023, the price difference has further reduced — suggesting <span class="font-semibold">improved parity</span> in development and rising <span class="font-semibold">buyer trust</span> in opposition-led towns.'
        ],

        years: [2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013],
    },
    {
        number: 6,
        title: "Years Remaining on Lease",
        description: [
            'Resale prices generally <span class="font-semibold">decline as lease years decrease</span>, especially when flats fall below <span class="font-semibold">60 years remaining</span>. This is due to CPF and loan eligibility <span class="font-semibold"><a href="https://dollarsandsense.sg/5-things-need-know-buying-older-hdb-lease-less-50-years/" target="_blank" style="color: blue; text-decoration: underline;">restrictions</a></span>, which limit financing options and reduce buyer demand for older flats.',

            'However, flats with <span class="font-semibold">65–80 years remaining</span> sometimes defy this trend. Factors such as <span class="font-semibold">desirable locations</span>, <span class="font-semibold">modern amenities</span>, and appeal to <span class="font-semibold">elderly buyers</span> seeking convenience over lease length can <span class="font-semibold">sustain or even increase resale prices</span> despite shorter leases.',
        ],
        years: [
            1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
            2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
            2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
            2023,
        ],
    },
    {
        number: 7,
        title: "Demographics (Age)",
        description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
        ],
        years: [2007, 2008, 2009, 2010, 2011, 2012, 2013], // edit this
    },
];

const currentStep = computed(() => steps[currentStepIndex.value]);

onMounted(() => {
    steps.forEach((step, index) => {
        const triggerElement = document.querySelector(
            `[data-section3="${index}"]`
        );

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
                },
            });

            triggers.value.push(trigger);
        }
    });

    const afterStepsTrigger = document.querySelector(
        '[data-section3="after-steps"]'
    );
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
            },
        });
        triggers.value.push(trigger);
    }

    const beforeStepsTrigger = document.querySelector(
        '[data-section3="before-steps"]'
    );
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
            },
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
    const showFlatCharts = newIndex === 1 || newIndex === 2;
    const showScatterFlat = newIndex === 3;
    const showBoxPlot = newIndex === 4 || newIndex === 5;
    const showHSD = newIndex === 6;
    const showBoxPlotElectoral = newIndex === 7;
    const showLease = newIndex === 8;

    gsap.to(storeyScatterChartRef.value?.$el, {
        opacity: showScatter ? 1 : 0,
        duration: 0.3,
        ease: "power2.out",
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
        ease: "power2.out",
        onStart: () => {
            if (
                typeof flatTypeLineChartRef.value?.resizeAndRedraw ===
                "function"
            ) {
                flatTypeLineChartRef.value.resizeAndRedraw();
            }
        },
    });

    gsap.to(flatTypeScatterChartRef.value?.$el, {
        opacity: showScatterFlat ? 1 : 0,
        duration: 0.3,
        ease: "power2.out",
        onStart: () => {
            if (
                showScatterFlat &&
                typeof flatTypeScatterChartRef.value?.handleResize ===
                    "function"
            ) {
                flatTypeScatterChartRef.value.handleResize();
            }
        },
    });

    gsap.to(boxPlotPricePerSqmChartRef.value?.$el, {
        opacity: showBoxPlot ? 1 : 0,
        duration: 0.3,
        ease: "power2.out",
        onStart: () => {
            if (
                showBoxPlot &&
                typeof boxPlotPricePerSqmChartRef.value?.handleResize ===
                    "function"
            ) {
                boxPlotPricePerSqmChartRef.value.resizeAndRedraw();
            }

            if (
                newIndex === 4 &&
                typeof boxPlotPricePerSqmChartRef.value?.sortToOriginalOrder ===
                    "function"
            ) {
                boxPlotPricePerSqmChartRef.value.sortToOriginalOrder();
            }

            if (
                newIndex === 5 &&
                typeof boxPlotPricePerSqmChartRef.value
                    ?.sortByMedianDescending === "function"
            ) {
                boxPlotPricePerSqmChartRef.value.sortByMedianDescending();
            }
        },
    });

    gsap.to(lineChartHSDRef.value?.$el, {
        opacity: showHSD ? 1 : 0,
        duration: 0.3,
        ease: "power2.out",
        onStart: () => {
            if (
                showHSD &&
                typeof lineChartHSDRef.value?.resizeAndRedraw === "function"
            ) {
                lineChartHSDRef.value.resizeAndRedraw();
            }
        },
    });

    gsap.to(boxPlotElectoralBoundariesChartRef.value?.$el, {
        opacity: showBoxPlotElectoral ? 1 : 0,
        duration: 0.3,
        ease: "power2.out",
        onStart: () => {
            if (
                showBoxPlotElectoral &&
                typeof boxPlotElectoralBoundariesChartRef.value
                    ?.resizeAndRedraw === "function"
            ) {
                boxPlotElectoralBoundariesChartRef.value.resizeAndRedraw();
            }
        },
    });

    watch(currentStepIndex, () => {
        if (descScrollRef.value) {
            descScrollRef.value.scrollTop = 0;
        }
    });

    gsap.to(LineChartLeaseRemainingRef.value?.$el, {
        opacity: showLease ? 1 : 0,
        duration: 0.3,
        ease: "power2.out",
        onStart: () => {
            if (
                showLease &&
                typeof LineChartLeaseRemainingRef.value?.resizeAndRedraw ===
                    "function"
            ) {
                LineChartLeaseRemainingRef.value.resizeAndRedraw();
            }
        },
    });

    gsap.to(LineChartLeaseRemainingRef.value?.$el, {
        opacity: showLease ? 1 : 0,
        duration: 0.3,
        ease: "power2.out",
        onStart: () => {
            if (
                showLease &&
                typeof LineChartLeaseRemainingRef.value?.resizeAndRedraw ===
                    "function"
            ) {
                LineChartLeaseRemainingRef.value.resizeAndRedraw();
            }
        },
    });
});
</script>

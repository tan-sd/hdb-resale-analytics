<template>
    <section class="pt-40 w-full min-h-screen py-20 bg-white">
        <div data-section1="before-steps" class="h-[1vh]"></div>
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
                            Macro Overview
                        </h2>

                        <div class="space-y-3">
                            <p
                                class="uppercase text-xs md:text-sm font-semibold tracking-wide"
                            >
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
                                >
                                    {{ para }}
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
                <div class="sticky top-12 w-full">
                    <div
                        class="flex flex-col gap-5 lg:gap-10 xl:gap-12 items-center"
                    >
                        <div
                            class="w-full flex xl:max-w-full sm:max-w-[375px] max-w-[315px] justify-center"
                        >
                            <LineChartMedian
                                :highlightYears="activeYears"
                                :shouldHighlight="activeHighlight"
                            />
                        </div>
                        <div
                            class="w-full flex xl:max-w-full sm:max-w-[375px] max-w-[315px] justify-center"
                        >
                            <LineChartTransaction
                                :highlightYears="activeYears"
                                :shouldHighlight="activeHighlight"
                            />
                        </div>
                    </div>
                </div>

                <div class="absolute inset-0 pointer-events-none">
                    <div class="space-y-[1vh]">
                        <div
                            v-for="(step, index) in steps"
                            :key="index"
                            :data-section1="step.title"
                            class="h-[99vh]"
                        ></div>
                    </div>

                    <div data-section1="after-steps" class="h-[1vh]"></div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import LineChartMedian from "@/components/LineChartMedian.vue";
import LineChartTransaction from "@/components/LineChartTransaction.vue";
import { ref, computed, onMounted, onBeforeUnmount, watchEffect } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

const activeHighlight = ref(false);
const activeYears = ref([]);
const currentStepIndex = ref(0);
const progress = ref(0);
const triggers = ref([]);
const showBox = ref(true);
const isPastLastSection = ref(false);
const isAfterSteps = ref(false);
const isBeforeSteps = ref(true);

onMounted(() => {
    steps.forEach((step, index) => {
        const triggerElement = document.querySelector(
            `[data-section1="${step.title}"]`
        );

        if (triggerElement) {
            const trigger = ScrollTrigger.create({
                trigger: triggerElement,
                start: "top center",
                end: "bottom center",
                onEnter: () => {
                    currentStepIndex.value = index;
                    activeYears.value = step.years;
                    activeHighlight.value = true;
                },
                onEnterBack: () => {
                    currentStepIndex.value = index;
                    activeYears.value = step.years;
                    activeHighlight.value = true;
                },
                onUpdate: (self) => {
                    const progressValue = Math.round(self.progress * 100);
                    progress.value = progressValue;
                },
            });

            triggers.value.push(trigger);
        }
    });

    const afterStepsTrigger = document.querySelector('[data-section1="after-steps"]');
    if (afterStepsTrigger) {
        const trigger = ScrollTrigger.create({
            trigger: afterStepsTrigger,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => {
            isAfterSteps.value = true;
            },
            onEnterBack: () => {
            isAfterSteps.value = false;
            }
        });
        triggers.value.push(trigger);
    }

    const beforeStepsTrigger = document.querySelector('[data-section1="before-steps"]');
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
    triggers.value.forEach((trigger) => {
        if (trigger) trigger.kill();
    });
    triggers.value = [];
});

const steps = [
    {
        title: "1990–1993: Early Stagnation in a Restricted Market",
        description: [
            "In the early 1990s, the HDB resale market was still finding its footing. Regulations were tight, and opportunities for buyers were limited. There were no CPF housing grants for resale purchases, which meant first-time buyers had little financial help if they opted for the open market.",
            "Eligibility was equally stringent — only families with a valid family nucleus could buy resale flats, while singles were left out entirely. With access so restricted and few incentives in place, the market saw low demand and prices remained largely flat.",
        ],
        years: [
            1990, 1991, 1992, 1993
        ],
    },
    {
        title: "1994–1996: Policy Liberalisation and a Surge in Demand",
        description: [
            "The market began to shift in 1994 with the introduction of the CPF Housing Grant. First-time buyers purchasing resale flats near their parents could now receive up to $30,000 in support, making resale flats far more affordable and competitive with BTO options.",
            "In 1995, the government further widened access by allowing singles aged 35 and above to purchase resale flats. These key policy changes opened the floodgates for a broader pool of buyers, triggering a sharp surge in resale demand — and with it, a rapid increase in transaction volumes and prices.",
        ],
        years: [1994, 1995, 1996],
    },
    {
        title: "1997–2006: Market Cooling through Supply and Usage Restrictions",
        description: [
            "After the rapid surge in the mid-90s, the government moved to cool the market and safeguard long-term affordability. In 1997, CPF usage was restricted for the purchase of older flats, reducing financing options for aging resale units. The Minimum Occupation Period (MOP) was also more strictly enforced, requiring flat owners to live in their homes for at least five years before they could sell — a move aimed at curbing speculative activity.",
            "In the early 2000s, HDB also scaled back the launch of new BTO flats in response to oversupply concerns. These combined measures — tighter financing rules, stricter eligibility, and reduced supply — contributed to a prolonged period of declining prices and a relatively stagnant resale market.",
        ],
        years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006],
    },
    {
        title: "2007–2012: Demand Revival Amid Supply Constraints",
        description: [
            "As population growth picked up and household formation accelerated, the HDB resale market began to regain momentum. New flat supply had not kept pace with rising demand, leading to long BTO waiting times and pushing many first-time buyers toward the more accessible resale market.",
            "To improve affordability, the government enhanced support schemes such as the Additional CPF Housing Grant (AHG) and the Special CPF Housing Grant (SHG), particularly for lower- and middle-income households. With demand rising and new supply lagging behind, resale prices climbed steadily throughout this period.",
        ],
        years: [2007, 2008, 2009, 2010, 2011, 2012],
    },
    {
        title: "2013–2018: Cooling Measures and Loan Restrictions Stabilise the Market",
        description: [
            "To curb rising prices and cool an overheating market, the government introduced several policy interventions. The Additional Buyer’s Stamp Duty (ABSD), first implemented in 2011, began to bite as it raised costs for PRs, foreigners, and second-home buyers.",
            "In 2013, tighter loan rules followed: the Total Debt Servicing Ratio (TDSR) and Mortgage Servicing Ratio (MSR) reduced borrowing capacity. ABSD was raised again in 2018, further dampening investor demand. These measures collectively slowed demand and stabilised the market, leading to a prolonged period of flat resale prices.",
        ],
        years: [2013, 2014, 2015, 2016, 2017, 2018],
    },
    {
        title: "2019–2021: Recovery Driven by Grant Reform and Pandemic Effects",
        description: [
            "The resale market rebounded in 2019, fuelled by new affordability measures. The Enhanced CPF Housing Grant (EHG) replaced previous schemes, offering up to $80,000 for eligible first-time buyers — applicable to both BTO and resale flats. At the same time, CPF usage rules were tightened for older flats, steering demand toward newer resale units.",
            "When COVID-19 struck in 2020, BTO construction delays pushed more buyers to the resale market. The rise of remote work also spurred demand for larger or better-located homes. Combined, these factors triggered a sharp rise in resale prices.",
        ],
        years: [2019, 2020, 2021],
    },
    {
        title: "2022–2023: Moderation Through Renewed Cooling Measures",
        description: [
            "As post-pandemic prices continued to climb, the government introduced fresh cooling measures to rein in demand and protect affordability. In December 2021 and September 2022, policies were rolled out to tighten stress-testing for HDB loan applicants and impose a 15-month wait-out period for private property owners before buying resale flats.",
            "These moves targeted wealthier buyers and aimed to keep public housing accessible to genuine owner-occupiers. By 2023, resale prices remained elevated but had begun to stabilise, reflecting efforts to curb speculation without undermining home values.",
        ],
        years: [2022, 2023],
    },
];

const currentStep = computed(() => steps[currentStepIndex.value]);
</script>
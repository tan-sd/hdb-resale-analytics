<template>
    <section class="pt-40 w-full min-h-screen py-20 bg-white">
        <div
            class="w-full px-6 mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12"
        >
            <div class="w-full max-w-lg mx-auto">
                <div
                    class="xl:sticky xl:top-64 fixed bottom-3 left-0 right-0 z-10 px-4 xl:px-0"
                    :class="{ hidden: !showBox }"
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
                            :data-title="step.title"
                            class="h-[99vh]"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import LineChartMedian from "@/components/LineChartMedian.vue";
import LineChartTransaction from "@/components/LineChartTransaction.vue";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
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

onMounted(() => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const isSmallScreen = window.innerWidth < 1280;
        const lastSection = document.querySelector(
            `[data-title="${steps[steps.length - 1].title}"]`
        );

        if (lastSection) {
            const lastSectionBottom =
                lastSection.getBoundingClientRect().bottom;
            isPastLastSection.value =
                lastSectionBottom < window.innerHeight / 2;
        }
        if (isSmallScreen) {
            showBox.value = scrollY > 600 && !isPastLastSection.value;
        } else {
            showBox.value = true;
        }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    steps.forEach((step, index) => {
        const triggerElement = document.querySelector(
            `[data-title="${step.title}"]`
        );

        if (triggerElement) {
            const trigger = ScrollTrigger.create({
                trigger: triggerElement,
                start: "top center",
                end: "bottom center",
                // For debugging
                // markers: true,
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

    ScrollTrigger.refresh();
});

onBeforeUnmount(() => {
    window.removeEventListener("scroll", handleScroll);
    triggers.value.forEach((trigger) => {
        if (trigger) trigger.kill();
    });
    triggers.value = [];
});

const steps = [
    {
        title: "1990–1993: Early Stagnation in a Restricted Market",
        description: [
            "During this period, the HDB resale market was still nascent and heavily restricted. There were no CPF housing grants available for resale buyers, meaning that first-time buyers had little financial support if they chose to buy on the open market. Eligibility was also tightly controlled — only families with a valid family nucleus could buy resale flats, and singles were completely excluded. With limited access and no incentives, demand for resale flats was low, and prices remained relatively stagnant."
        ],
        years: [
            1990, 1991, 1992, 1993
        ],
    },
    {
        title: "1994–1996: Policy Liberalisation and a Surge in Demand",
        description: [
            "The market began to transform in 1994 with the introduction of the CPF Housing Grant. This policy provided up to $30,000 to first-time buyers purchasing resale flats near their parents, making resale flats significantly more affordable and competitive with BTO flats. In 1995, the government also expanded eligibility by allowing singles aged 35 and above to purchase resale flats, further increasing demand. These changes broadened access to the market and triggered a sharp surge in resale transactions and prices."
        ],
        years: [1994, 1995, 1996],
    },
    {
        title: "1997–2006: Market Cooling through Supply and Usage Restrictions",
        description: [
            "Following the mid-90s spike, the government began tightening policy levers to control demand and maintain long-term affordability. In 1997, CPF usage was restricted for the purchase of older flats, reducing financing options for aging resale units. The Minimum Occupation Period (MOP) was also enforced more stringently, requiring flat owners to live in their homes for at least five years before selling, which limited speculative activity. During the early 2000s, HDB scaled back BTO launches in response to oversupply concerns. These combined measures led to a long period of price decline and market plateau."
        ],
        years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006],
    },
    {
        title: "2007–2012: Demand Revival Amid Supply Constraints",
        description: [
            "As population growth resumed and household formation increased, the resale market regained momentum. New flat supply had not kept up with demand, resulting in long BTO waiting times and pushing many first-time buyers toward the resale market. At the same time, the government enhanced grant support for resale buyers — the Additional CPF Housing Grant (AHG) and Special CPF Housing Grant (SHG) were improved, increasing affordability for lower- and middle-income households. These policies, combined with continued supply lag, caused resale prices to climb steadily."
        ],
        years: [2007, 2008, 2009, 2010, 2011, 2012],
    },
    {
        title: "2013–2018: Cooling Measures and Loan Restrictions Stabilise the Market",
        description: [
            "In response to rising prices and concerns about overheating, the government introduced a series of cooling measures to slow demand. In 2011, the Additional Buyer’s Stamp Duty (ABSD) was introduced, imposing higher taxes on property purchases by PRs, foreigners, and second-time buyers. Its effects became more prominent in the following years. In 2013, two significant loan curbs were implemented: the Total Debt Servicing Ratio (TDSR), which limited total loan repayments to 60% of gross monthly income, and the Mortgage Servicing Ratio (MSR), which capped HDB loan repayments at 30%. These rules effectively reduced loan sizes and borrowing power for many buyers. In 2018, ABSD was increased again, particularly targeting investors and upgraders. These measures collectively cooled the market, leading to a plateau in resale prices."
        ],
        years: [2013, 2014, 2015, 2016, 2017, 2018],
    },
    {
        title: "2019–2021: Recovery Driven by Grant Reform and Pandemic Effects",
        description: [
            "The resale market rebounded from 2019, largely due to renewed affordability initiatives. The Enhanced CPF Housing Grant (EHG) was launched in 2019, consolidating and replacing AHG and SHG. This grant provided up to $80,000 for eligible first-time buyers and could be applied to both BTO and resale flats. Simultaneously, the CPF usage policy was tightened for flats with less than 60 years of lease remaining, nudging demand toward newer resale flats. When the COVID-19 pandemic hit in 2020, BTO construction delays caused many buyers to turn to resale as a faster route to homeownership. The shift to remote work also increased demand for larger or better-located flats. These factors collectively created a demand surge, driving prices up through 2020 and 2021."
        ],
        years: [2019, 2020, 2021],
    },
    {
        title: "2022–2023: Moderation Through Renewed Cooling Measures",
        description: [
            "As prices continued rising post-pandemic, the government responded with new rounds of cooling measures aimed at tempering demand and ensuring long-term affordability. In December 2021 and again in September 2022, HDB introduced policies that included stricter stress-testing for HDB loan applicants and a mandatory 15-month wait-out period for private property owners before they could purchase a resale flat. These measures were designed to reduce demand from cash-rich buyers and ensure that public housing remained accessible to genuine owner-occupiers. By 2023, the resale market remained elevated but more stable, reflecting the balancing act between sustaining flat values and preventing excessive speculation."
        ],
        years: [2022, 2023],
    },
];

const currentStep = computed(() => steps[currentStepIndex.value]);
</script>

<style>
* {
  outline: 1px solid red;
}</style>
<template>
    <section class="w-screen min-h-screen px-8 py-20 bg-white">
        <div
            class="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12"
        >
            <div class="w-full lg:w-2/5 space-y-6">
                <div>
                    <h2
                        class="text-3xl md:text-5xl font-bold mb-4 uppercase tracking-tight section-title"
                    >
                        Macro Overview
                    </h2>
                    <div>
                        <div
                            v-for="step in steps"
                            :key="step.title"
                            :data-title="step.title"
                            class="min-h-[80vh] flex flex-col justify-content space-y-2"
                        >
                            <p
                                class="uppercase text-sm text-muted-foreground font-semibold tracking-wide"
                            >
                                {{ step.title }}
                            </p>

                            <div
                                class="space-y-5 text-sm text-muted-foreground leading-relaxed"
                            >
                                <p
                                    v-for="(para, index) in step.description"
                                    :key="index"
                                >
                                    {{ para }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="w-full lg:w-3/5 lg:sticky lg:top-32">
                <LineChartMedian
                    :highlightYears="activeYears"
                    :shouldHighlight="activeHighlight"
                />
                <LineChartTransaction
                    :highlightYears="activeYears"
                    :shouldHighlight="activeHighlight"
                />
            </div>
        </div>
    </section>
</template>

<script setup>
import LineChartMedian from "@/components/LineChartMedian.vue";
import LineChartTransaction from "@/components/LineChartTransaction.vue";
import { ref, onMounted } from "vue";
const activeHighlight = ref(false);

onMounted(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const title = entry.target.getAttribute("data-title");
                    const step = steps.find((s) => s.title === title);
                    if (step) {
                        activeYears.value = step.years;
                        activeHighlight.value = true;
                    }
                }
            });
        },
        { rootMargin: "0px 0px -20% 0px", threshold: 0.2 }
    );

    document.querySelectorAll("[data-title]").forEach((el) => {
        observer.observe(el);
    });
});

const steps = [
    {
        title: "Setting the Stage (1990-2023)",
        description: [
            "Over the past three decades, the HDB resale market has experienced several waves of change — shaped not just by economic conditions, but more fundamentally by public housing policies.",
            "While short-term price movements often reflect shifts in market sentiment or global events, the long-term trends in resale prices have been steered by deliberate government interventions — from housing grants and eligibility rules to loan caps and supply adjustments.",
            "This section presents a macro-level view of the market from 1990 to 2023, with two charts: one tracking median resale prices, and the other showing transaction volumes. Together, they highlight how key policies and economic shifts left visible imprints on both pricing and activity levels.",
        ],
        years: [
            1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
            2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
            2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
            2023,
        ],
    },
    {
        title: "Slow Growth (1990-1994)",
        description: [
            "During the early 1990s, the resale market was relatively underdeveloped. Most Singaporeans were still opting for new flats directly from HDB, as resale flats lacked financial incentives for first-time buyers. At this point, there were no CPF Housing Grants available for resale purchases, which made it harder for young households to afford resale units. Financing options were limited, and CPF usage was still tightly regulated, particularly for older flats with shorter leases.",
            "Additionally, access to the resale market was restricted. Singles were not allowed to buy resale flats on the open market, and eligibility was generally limited to families with a valid family nucleus. These constraints meant that the pool of resale buyers was narrow, which dampened resale demand. As a result, price growth was muted, and the market experienced a prolonged phase of stagnation.",

        ],
        years: [1990, 1991, 1992, 1993, 1994],
    },
    {
        title: "Sharp Surge (1994-1996)",
        description: [
            "The mid-1990s marked a turning point, as the government took its first major steps to actively develop the resale market. In 1994, the CPF Housing Grant scheme was introduced, offering first-time buyers up to $30,000 in subsidies when purchasing resale flats near their parents. This was a game-changing policy that shifted attention from BTO flats toward resale options by making resale units significantly more affordable.",
            "Then in 1995, the eligibility criteria for resale flats were expanded to include singles aged 35 and above. This allowed a previously excluded segment of the population to participate in the resale market for the first time. The combined effect of generous grants and expanded eligibility led to a sudden and sharp increase in demand. At the same time, more executive and larger flats were entering the resale pool, increasing the average valuation of resale flats. These dynamics culminated in a steep rise in resale prices, peaking in the mid-1990s.",

        ],
        years: [1994, 1995, 1996],
    },
    {
        title: "Plateau (1997-2006)",
        description: [
            "Following the surge, the resale market entered a decade-long decline and plateau. One of the key reasons was the government's effort to restore balance and sustainability in the housing ecosystem. CPF usage for older flats was tightened, making it harder to finance the purchase of aging resale units. In parallel, the 5-year Minimum Occupation Period (MOP) was more strictly enforced, limiting how quickly flats could be resold and effectively curbing speculative buying behavior.",
            "In addition to demand-side cooling, the government also acted on the supply side. During the early 2000s, HDB intentionally reduced the number of new BTO launches in response to an oversupply situation from the previous decade. While this may seem like it would tighten the market, in reality, it coincided with already soft resale demand, and the combined effect led to further price stagnation. This entire period was defined by policy restraint — the state avoided stimulating demand and instead allowed the market to stabilize.",

        ],
        years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006],
    },
    {
        title: "Rapid Growth (2007-2013)",
        description: [
            "By the late 2000s, demand for resale flats began to recover, largely because new flat supply had not kept pace with household formation. The long BTO waiting times pushed many first-time buyers into the resale market. This trend was reinforced by the government's improvements to affordability schemes.",
            "Both the Additional CPF Housing Grant (AHG) and the Special CPF Housing Grant (SHG) were enhanced during this period, offering higher payouts and extending eligibility to more income brackets. In 2009, the Proximity Housing Grant (PHG) was introduced to encourage family co-location by offering additional subsidies to buyers who chose to live near their parents or children. While these grants supported young families, the broader effect was an increase in resale demand across the board.",
            "Since BTO launches were still constrained and population growth was strong, resale prices climbed rapidly during this time. By 2013, the resale market had reached a new peak, driven primarily by demand outstripping supply.",
        ],
        years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
    },
    {
        title: "Cooling Measures (2013-2019)",
        description: [
            "ABSD, TDSR, and MSR introduced to slow market overheating.",
        ],
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
    },
    {
        title: "Post-COVID Recovery (2019-2023)",
        description: [
            "Enhanced CPF grant + COVID demand shift led to renewed growth.",
        ],
        years: [2019, 2020, 2021, 2022, 2023],
    },
];

const activeYears = ref(steps[0].years);
</script>

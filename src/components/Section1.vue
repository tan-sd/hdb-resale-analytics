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
        { rootMargin: "0px 0px -60% 0px", threshold: 0.2 }
    );

    document.querySelectorAll("[data-title]").forEach((el) => {
        observer.observe(el);
    });
});

const steps = [
    {
        title: "Setting the Stage (1990-2023)",
        description: [
            "To understand the forces behind rising HDB resale prices, we begin with a bird's-eye view of the last two decades. From economic swings to government interventions, a pattern emerges — one shaped by policy, inflation, and people.",
            "This chart tracks the median resale price of HDB flats from 1990 to 2023. It offers a macro perspective on how prices have shifted nationally — and how key moments like cooling measures or interest rate changes influenced the market.",
            "Keep an eye out for major events: the introduction of TDSR, the global financial crisis, and the post-COVID market surge. Each left a visible imprint on price trends.",
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
            "Strict eligibility rules. No grants. Resale market remained stagnant.",
        ],
        years: [1990, 1991, 1992, 1993, 1994],
    },
    {
        title: "Sharp Surge (1994-1996)",
        description: [
            "Introduction of CPF Housing Grant and singles eligiblity expanded demand.",
        ],
        years: [1994, 1995, 1996],
    },
    {
        title: "Plateau (1997-2006)",
        description: [
            "Tighter CPF usage and MOP enforcement slowed resale activity.",
        ],
        years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006],
    },
    {
        title: "Rapid Growth (2007-2013)",
        description: [
            "Grant enhancements and limited BTO supply pushed resale prices higher.",
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

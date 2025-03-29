<template>
    <section class="w-full min-h-screen px-8 py-20 bg-white">
        <div
            class="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12"
        >
            <div class="w-full lg:w-2/5 space-y-6">
                <div>
                    <h2
                        class="text-3xl md:text-5xl font-bold mb-4 uppercase tracking-tight section-title"
                    >
                        Factors
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
                <!-- <ScatterPlotStories /> -->
                <LineChartFlatType />
                <BoxPlotPricePerSqm />
            </div>
        </div>
    </section>
</template>

<script setup>
import LineChartFlatType from './LineChartFlatType.vue';
import ScatterPlotStories from './ScatterPlotStories.vue';
import BoxPlotPricePerSqm from './BoxPlotPricePerSqm.vue';
const steps = [
    {
        title: "Stories",
        description: [
            "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        ],
        years: [
            1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
            2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
            2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
            2023,
        ],
    },
    {
        title: "Flat types and sizes",
        description: [
            "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        ],
        years: [1990, 1991, 1992, 1993, 1994],
    },
    {
        title: "Price per square metre HDB in different planning areas",
        description: [
            "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        ],
        years: [1994, 1995, 1996],
    },
    {
        title: "Number of amenities and distance to amenities",
        description: [
            "The number of amenities and distance to amenities are important factors that influence the resale price of HDB flats.",
        ],
        years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006],
    },
    {
        title: "Electoral boundaries",
        description: [
            "Grant enhancements and limited BTO supply pushed resale prices higher.",
        ],
        years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
    },
];
</script>

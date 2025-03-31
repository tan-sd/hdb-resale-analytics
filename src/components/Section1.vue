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
    // ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

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
        title: "Setting the Stage (1990-2023)",
        description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
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
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
        ],
        years: [1990, 1991, 1992, 1993, 1994],
    },
    {
        title: "Sharp Surge (1994-1996)",
        description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
        ],
        years: [1994, 1995, 1996],
    },
    {
        title: "Plateau (1997-2006)",
        description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
        ],
        years: [1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006],
    },
    {
        title: "Rapid Growth (2007-2013)",
        description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
        ],
        years: [2007, 2008, 2009, 2010, 2011, 2012, 2013],
    },
    {
        title: "Cooling Measures (2013-2019)",
        description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
        ],
        years: [2013, 2014, 2015, 2016, 2017, 2018, 2019],
    },
    {
        title: "Post-COVID Recovery (2019-2023)",
        description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
        ],
        years: [2019, 2020, 2021, 2022, 2023],
    },
];

const currentStep = computed(() => steps[currentStepIndex.value]);
</script>
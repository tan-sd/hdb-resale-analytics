<template>
    <section
        class="w-screen h-screen bg-gradient-to-br to-white flex flex-col justify-center items-center text-center space-y-6 px-4 relative"
    >
        <h1 class="text-5xl md:text-7xl lg:text-9xl uppercase section-title">
            <span
                class="font-extrabold inline-flex flex-col items-center gap-2"
            >
                Behind the <br />
                <span class="font-extrabold inline-flex items-center gap-2">
                    Price Tag
                    <Tag class="w-10 h-10 md:w-14 md:h-14 lg:w-24 lg:h-24" />
                </span>
            </span>
        </h1>
        <p
            class="text-[0.625rem] md:text-sm lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed tracking-widest"
        >
            A deep dive into Singapore's HDB Resale Market
        </p>

        <div class="arrow-down text-gray-500">
            <ArrowDown class="w-10 h-10 md:w-14 md:h-14 lg:w-20 lg:h-20" />
        </div>
    </section>
</template>

<script setup>
import { ArrowDown } from "lucide-vue-next";
import { Tag } from "lucide-vue-next";
</script>

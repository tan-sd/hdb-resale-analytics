<script setup>
import MapChart from "../components/MapChart.vue";
import Title from "../components/Title.vue";
import Dashboard from "@/components/Dashboard.vue";
import Section1 from "../components/Section1.vue";
import FactorsOverview from "../components/FactorsOverview.vue";
import Section2 from "../components/Section2.vue";
</script>

<template>
    <main>
        <Title />
        <Section1 />
        <FactorsOverview />
        <Section2 />
        <Dashboard />
    </main>
</template>

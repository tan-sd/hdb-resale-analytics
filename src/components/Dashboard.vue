<template>
    <main class="flex flex-1 items-center justify-center">
      <div class="container py-6">
        <section class="overflow-hidden rounded-[0.5rem] border shadow" style="background-color: #ffffff;">
          <div class="flex flex-col">
            <div class="flex-1 space-y-4 p-8 pt-6">
              <div class="flex items-center justify-between space-y-2">
                <h2 class="text-3xl font-bold">Dashboard</h2>
              </div>
              <Tabs defaultValue="overview" class="space-y-4">
                <!-- <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
                  <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
                  <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger>
                </TabsList> -->
                <TabsContent value="overview" class="space-y-4">
                  <!-- <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> -->
                    <div class="grid gap-4">
                    <Card class="w-full h-full flex flex-col">
                      <CardContent class="flex-grow p-0">
                        <MapChart />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>
      </div>
    </main>
  </template>

<script setup>
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MapChart from "./MapChart.vue";
</script>
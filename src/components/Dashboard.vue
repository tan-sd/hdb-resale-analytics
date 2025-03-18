<template>
    <main class="flex flex-1 items-center justify-center">
      <div class="container py-6">
        <section class="overflow-hidden rounded-[0.5rem] border shadow" style="background-color: #ffffff;">
          <div class="flex flex-col">
            <div class="flex-1 space-y-4 p-8 pt-6">
              <div class="flex items-center justify-between space-y-2">
                <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
              </div>
              <Tabs defaultValue="overview" class="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analytics" disabled>Analytics</TabsTrigger>
                  <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
                  <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" class="space-y-4">
                  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card class="w-f">
                      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle class="text-sm font-medium">Total Revenue</CardTitle>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          class="h-4 w-4 text-muted-foreground"
                        >
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </CardHeader>
                      <CardContent>
                        <div class="text-2xl font-bold">$45,231.89</div>
                        <p class="text-xs text-muted-foreground">+20.1% from last month</p>
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
</script>
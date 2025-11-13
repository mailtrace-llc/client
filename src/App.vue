<!-- client/src/App.vue -->
<script setup lang="ts">
import { RouterView } from "vue-router";
import Loader from "@/components/Loader.vue";
import "@/styles/index.css";
</script>

<template>
  <Loader />
  <RouterView />
</template>

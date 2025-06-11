<template>
  <v-container class="d-flex justify-center align-center">
    <v-card class="pa-6 rounded-lg elevation-1" height="95vh" width="100%">
      <v-card-title class="text-h5 font-weight-bold mb-4">
        {{ title }}
      </v-card-title>
      <slot></slot>
    </v-card>
  </v-container>
</template>
<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    default: "teste",
  },
});
</script>

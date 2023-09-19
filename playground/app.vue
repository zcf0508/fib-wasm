<script setup lang="ts">
import { fib } from 'fib-wasm'

const layer = ref(1)

const res = ref<number[]>([])

onMounted(() => {
  res.value = []
  res.value.push(fib(layer.value))
})

watch(layer, () => {
  res.value = []
  if(layer.value > 0) {
    for (let i = 1; i <= layer.value; i++) {
      res.value.push(fib(i));
    }
  }
})
</script>

<template>
  <div>
    <h1>fib-wasm</h1>
    <input v-model="layer" type="number" />
    <div v-for="item in res" :key="item">{{ item }}</div>
  </div>
</template>

<style scoped>

</style>
<script setup lang="ts">
import { fib } from 'fib-wasm'

// 显示一个 fib 金字塔
// 引入的 fib 函数接受一个数字，然后返回数列中这个位置的数字

// fib 金字塔的层数
const layer = ref(1)

// fib 金字塔的结果
const res = ref<number[]>([])

onBeforeMount(() => {
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
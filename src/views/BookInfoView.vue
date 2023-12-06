<script setup>
import { ref } from 'vue'
import axios from 'axios'

const todoData = ref(null)

function getTodo() {
  const url = `http://localhost:3000/users/0`
  todoData.value = null
  axios
    .get(url)
    .then((res) => todoData.value = res.data)
    .catch((error) => todoData.value = error)
}
getTodo()
</script>

<template>
  <h1>Vue 3でJSONを読み込むサンプル(簡易版)</h1>
  <p v-if="!todoData">Loading...</p>
  <pre v-else>{{ todoData }}</pre>
</template>
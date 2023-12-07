<script setup>
import { ref } from 'vue'
import axios from 'axios'

const todoData = ref(null)

function getTodo() {
  const url = `http://localhost:3000/books`
  todoData.value = null
  axios
    .get(url)
    .then((res) => todoData.value = res.data)
    .catch((error) => todoData.value = error)
}
getTodo()

// export default {
//     name: 'BookList',
// }
</script>

<template>
  <div class="booklist">
    <h1>booklist</h1>
    <p v-if="!todoData">Loading...</p>
    <pre v-else v-for="data in todoData" v-bind:key="data">{{ data.id }}</pre>
    </div>
</template>
  
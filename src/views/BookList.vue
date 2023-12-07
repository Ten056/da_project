<script setup>
import { ref } from 'vue'
import axios from 'axios'

const todoData = ref(null)

function getTodo() {
  // axiosを利用し、サーバーよりデータを取得
  const url = `http://localhost:3000/books`
  todoData.value = null
  axios
    .get(url)
    .then((res) => todoData.value = res.data)
    .catch((error) => todoData.value = error)
}
getTodo()

</script>

<template>
  <div class="booklist">
    <h1>予約済み図書一覧</h1>
    <div id="tmp">
      <select><option>すべて</option></select>
    </div>
    <div id="mainContents">
      <table>
        <thead><tr>
          <th id="icon">アイコン</th>
          <th id="title">タイトル</th>
          <th id="status">ステータス</th>
        </tr></thead>

        <tbody>
          <p v-if="!todoData">Loading...</p>
          <tr v-else v-for="data in todoData" v-bind:key="data">
            <td><img v-bind:src='data.id + ".png"' alt="icon"></td>
            <td>{{ data.title }}</td>
            <td>{{ data.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<style>
div#mainContents table{
  margin:0 auto 0 auto;
  width:800px;
}

div#mainContents table th{
  background-color: rgb(229, 235, 240);
}

  div#mainContents table th#icon{
  border:solid;
  width:50px;
}

div#mainContents table th#title{
  border:solid;
  width:80px;
}


div#mainContents table th#status{
  border:solid;
  width:30px;
}

select{
  position:relative;
  left:-365px;
  margin-bottom: 2px;
  font-size:15px;

}

img{
  width: 20px;
  height: 20px;
}

/* table{
	table-layout: fixed;
	width: 100%;
}	 */
</style>
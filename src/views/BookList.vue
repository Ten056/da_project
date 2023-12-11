<template>
  <div class="booklist">
    <h1>予約済み図書一覧</h1>
    <div id="tmp">
      <!-- <select><option>すべて</option></select> -->
    </div>
    <div id="mainContents">
      <table>
        <thead><tr>
          <th id="icon" @click="sortBy('id')" v-bind:class="{ 'sort-asc': sortKey === 'id' && sortOrder === 1, 'sort-desc': sortKey === 'id' && sortOrder === -1 }">アイコン</th>
          <th id="title" @click="sortBy('title')" v-bind:class="{ 'sort-asc': sortKey === 'title' && sortOrder === 1, 'sort-desc': sortKey === 'title' && sortOrder === -1 }">タイトル</th>
          <th id="status" @click="sortBy('status')" v-bind:class="{ 'sort-asc': sortKey === 'status' && sortOrder === 1, 'sort-desc': sortKey === 'status' && sortOrder === -1 }">計画作成状況</th>
        </tr></thead>

        <tbody>
          <p v-if="!todoData">Loading...</p>
          <tr v-else v-for="data in sortedUsers" v-bind:key="data">
            <td>
              <router-link v-if="data.status !== -1"  :to="`./bookInfo/${data.id}`"><img v-bind:src='data.thumbnail' alt="icon"></router-link>
              <router-link v-if="data.status === -1"  :to="`./bookInfo/${data.id}/${data.status}`"><img v-bind:src='data.thumbnail' alt="icon"></router-link>
            </td>
            <td><router-link :to="`./bookInfo/${data.id}`">{{ data.title }}</router-link></td>
            <td><router-link :to="`./bookInfo/${data.id}`">{{ data.status }}</router-link></td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: "test_page",
    data: () => ({
      todoData: "",
      sortKey: '',
      sortOrder: 1,
    }),
    mounted() {
      axios.get("http://localhost:3000/books")
      .then(response => this.todoData = response.data)
      .catch(error => console.log(error))
      // axios.get("http://localhost:3000/headers")
      // .then(response => this.headers = response.data)
      // .catch(error => console.log(error))
    },
    computed: {
      sortedUsers() {
        const todoData_tmp = [...this.todoData];
        const sortKey = this.sortKey;
        const sortOrder = this.sortOrder;

        if (sortKey) {
          todoData_tmp.sort((a, b) => {
            const modifier = sortOrder === 1 ? 1 : -1;
            if (a[sortKey] < b[sortKey]) return -1 * modifier;
            if (a[sortKey] > b[sortKey]) return 1 * modifier;
            return 0;
          });
        }
        return todoData_tmp;
      },
    },
    methods: {
      sortBy(key) {
        if (this.sortKey === key) {
          this.sortOrder = this.sortOrder * -1;
        } else {
          this.sortKey = key;
          this.sortOrder = 1;
        }
      },
    },
  }
</script>

<style scoped>
table{
  border-collapse: collapse;
  border-spacing: 0;
  position: relative;
  margin: auto;
  width: 80%;
}

table tr{
  border-bottom: solid 1px #eee;
  cursor: pointer;
}

table tr:hover{
  background-color: #d4f0fd;
}

table th,table td{
  text-align: center;
  width: 25%;
  padding: 15px 0;
}

table td.icon{
  background-size: 35px;
  background-position: left 5px center;
  background-repeat: no-repeat;
  padding-left: 30px;
}

table th{
  background-color: #f2f2f2;
}

img{
  width: 40px;
  height: 40px;
}

.sort-asc:after {
  content: ' ▲';
}

.sort-desc:after {
  content: ' ▼';
}

/* table{
	table-layout: fixed;
	width: 100%;
}	 */
</style>
<template>
  <div class="booklist">
    <h1>予約済み図書一覧</h1>
    <div id="tmp">
      <!-- <select><option>すべて</option></select> -->
    </div>
    <div id="mainContents">
      <table>
        <thead>
          <tr>
            <th id="icon" @click="sortBy('id')"
              v-bind:class="{ 'sort-asc': sortKey === 'id' && sortOrder === 1, 'sort-desc': sortKey === 'id' && sortOrder === -1 }">
              アイコン</th>
            <th id="title" @click="sortBy('title')"
              v-bind:class="{ 'sort-asc': sortKey === 'title' && sortOrder === 1, 'sort-desc': sortKey === 'title' && sortOrder === -1 }">
              タイトル</th>
            <th id="status" @click="sortBy('status')"
              v-bind:class="{ 'sort-asc': sortKey === 'status' && sortOrder === 1, 'sort-desc': sortKey === 'status' && sortOrder === -1 }">
              計画作成状況</th>
            <th id="deadline" style="text-align:left" @click="sortBy('deadline')"
              v-bind:class="{ 'sort-asc': sortKey === 'deadline' && sortOrder === 1, 'sort-desc': sortKey === 'deadline' && sortOrder === -1 }">
              読了予定日</th>

          </tr>
        </thead>

        <tbody>
          <p v-if="!todoData">Loading...</p>
          <tr v-on:mouseover="data.isHover = true" v-on:mouseleave="data.isHover = false" v-else
            v-for="data in  sortedUsers " v-bind:key="data" @click="navigateTo(data)">
            <td v-bind:class="{ dangerClass: isDanger[data.id], cautionClass: isCaution[data.id] }">
              <img v-bind:src='data.thumbnail' alt="icon">
            </td>
            <td v-bind:class="{ dangerClass: isDanger[data.id], cautionClass: isCaution[data.id] }">
              {{ data.title }}
            </td>
            <td v-bind:class="{ dangerClass: isDanger[data.id], cautionClass: isCaution[data.id] }">
              <p v-if="(data.status != -1) & (data.total_page != data.status)">進行中</p>
              <p v-if="(data.status != -1) & (data.total_page == data.status)">読了済み</p>
              <p v-if="data.status == -1">計画未作成</p>
            </td>

            <td v-bind:class="{ dangerClass: isDanger[data.id], cautionClass: isCaution[data.id] }">
              <p style="text-align:left" v-if="data.status !== -1">{{ data.deadline }}<span
                  v-if="(isDanger[data.id] == true || isCaution[data.id] == true) && data.isHover" class="restDays">
                  残り {{ Math.ceil((Date.parse(data.deadline) - nowDate) / 1000 / 60 / 60 / 24) + '日' }}</span> </p>
              <p v-if="data.status === -1"> </p>
            </td>

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
    todoData: [],
    sortKey: '',
    sortOrder: 1,
    isDanger: [],
    isCaution: [],
    nowDate: "",
    isHover: false

  }),
  mounted() {
    axios.get("http://localhost:3000/books")
      .then(response => {
        let tmpData = response.data
        for (let i = 0; i < tmpData.length; i++) {
          tmpData[i].isHover = false
          if (tmpData[i].status === -1 || tmpData[i].total_page != tmpData[i].status)
            this.todoData.push(tmpData[i])


        }
        this.nowDate = new Date()
        var now = new Date()
        for (let i = 0; i < tmpData.length; i++) {
          var distDate = Date.parse(tmpData[i].deadline)
          var diffMilliSec = distDate - now
          var diffDays = parseInt(diffMilliSec / 1000 / 60 / 60 / 24)  /*ミリ秒を日数に変換*/

          if (diffDays < 7 && tmpData[i].status != -1)
            this.isDanger[i] = true
          if (diffDays < 14 && tmpData[i].status != -1)
            this.isCaution[i] = true
        }


      })
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

      if (sortKey === "deadline") {
        for (let i = 0; i < todoData_tmp.length; i++) {
          if ((todoData_tmp[i].deadline === null || todoData_tmp[i].deadline === '1975-1-1') && sortOrder == 1) {
            todoData_tmp[i].deadline = "2099-1-1"
          } else if (todoData_tmp[i].deadline === null || todoData_tmp[i].deadline === '2099-1-1') {

            todoData_tmp[i].deadline = "1975-1-1"
          }
        }
        for (let i = 0; i < todoData_tmp.length; i++) {
          console.log("dead", todoData_tmp[i].deadline)
        }

        todoData_tmp.sort((a, b) => {
          const modifier = sortOrder === 1 ? 1 : -1;

          if (Date.parse(a[sortKey]) < Date.parse(b[sortKey])) return -1 * modifier;
          if (Date.parse(a[sortKey]) > Date.parse(b[sortKey])) return 1 * modifier;
          return 0;
        })
      } else if (sortKey) {
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
      console.log(key)
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder * -1;
      } else {
        this.sortKey = key;
        this.sortOrder = 1;
      }
    },
    navigateTo(data) {
      console.log(data)
      if (data.status === -1) {
        this.$router.push({ path: `./bookInfo/${data.id}/${data.status}` });
      } else if (data.status !== -1) {
        this.$router.push({ path: `/bookInfo/${data.id}` });
      }
    }
  },
}
</script>

<style scoped>
table {
  border-collapse: collapse;
  border-spacing: 0;
  position: relative;
  margin: auto;
  width: 80%;
}

table tr {
  border-bottom: solid 1px #eee;
  cursor: pointer;
}

table tr:hover {
  background-color: #d4f0fd;
}

table th,
table td {
  text-align: center;
  width: 25%;
  padding: 15px 0;
}

table td.icon {
  background-size: 35px;
  background-position: left 5px center;
  background-repeat: no-repeat;
  padding-left: 30px;
}

table th {
  background-color: #f2f2f2;
}

img {
  width: 40px;

}

.sort-asc:after {
  content: ' ▲';
}

.sort-desc:after {
  content: ' ▼';
}

.cautionClass {
  background-color: rgba(251, 251, 0, 0.35);

}

.dangerClass {
  background-color: rgba(253, 0, 0, 0.35);
}

/* table{
	table-layout: fixed;
	width: 100%;
}	 */

img {
  width: 50px;
}

.restDays {

  color: white;
  background-color: #5d5d63;
  /* font-weight: bold; */
  border-radius: 30px;
  padding: 5px;
  margin-left: 8px;
  text-align: center;
  width: 1000px;


}
</style>
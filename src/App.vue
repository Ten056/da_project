<template>
  <nav>
    <!-- <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/test">Test</router-link> | -->
    <!-- <router-link to="/booklist">BookList</router-link> -->
    <!-- <router-link to="/bookInfo/0">本の計画</router-link> -->
    <br>
  </nav>
  <router-view />

  <v-app>
    <v-app-bar app dark color="#1F4E79">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title><router-link class="routerLink" to="/booklist">読書管理システム</router-link></v-toolbar-title>
      <template v-slot:append>
        <v-btn @click="showRanking">
          <svg-icon type="mdi" :path="path"></svg-icon>
        </v-btn>
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" color="#757575">
      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" link :to="item.url" @click="drawer = false">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer v-model="rankingDrawer" color="#757575" location="right" width="100%">
      <v-card v-if="isMobileView">
        <v-card-title>本日の読書量ランキング</v-card-title>
        <v-card-text>
          <v-select v-model="selectedDepartment" :items="departments" label="職種"
            @update:model-value="filterByDepartment"></v-select>
          <v-data-table :headers="smHeaders" items-per-page-text="表示行数" :items="filteredUsers.map(u => {
            return { rank: u.rank, avatar: u.avatar, name: u.name, score: u.score }
          })" :items-per-page="10">
            <template v-slot:[`item.avatar`]="{ item }">
              <v-avatar>
                <v-img :src="item.avatar"></v-img>
              </v-avatar>
            </template>
            <template v-slot:[`item.score`]="{ item }">
              {{ item.score }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
      <v-card v-if="!isMobileView">
        <v-card-title>本日の読書量ランキング</v-card-title>
        <v-card-text>
          <v-select v-model="selectedDepartment" :items="departments" label="職種"
            @update:model-value="filterByDepartment"></v-select>
          <v-select v-model="selectedAge" :items="ages" label="年代" @update:model-value="filterByAge"></v-select>
          <v-data-table :headers="headers" :items="filteredUsers" items-per-page-text="表示行数" items-per-page="10">
            <template v-slot:[`item.avatar`]="{ item }">
              <v-avatar>
                <v-img :src="item.avatar"></v-img>
              </v-avatar>
            </template>
            <template v-slot:[`item.score`]="{ item }">
              {{ item.score }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiTrophyAward } from '@mdi/js';
import axios from 'axios'

export default {
  name: 'App',
  components: {
    SvgIcon
  },
  data: () => ({
    selectedDepartment: 'すべて',
    selectedAge: '全年代',
    ageMap: { _20代: 20, _30代: 30, _40代: 40, _50代: 50 },
    score: 0,
    departments: ['すべて', '営業', '事務', 'アプリSE', 'インフラSE'],
    ages: ['全年代', '_20代', '_30代', '_40代', '_50代'],
    path: mdiTrophyAward,
    drawer: false,
    rankingDrawer: false,
    isMobileView: window.innerWidth <= 600,
    items: [
      // { title: 'Home', icon: 'mdi-home' },
      { title: 'Book List', icon: 'mdi-book-open-page-variant', url: "/booklist" },
      { title: 'Read List', icon: 'mdi-checkbox-marked-outline', url: "/finishReading" },
      // { title: 'Ranking', icon: 'mdi-trophy-outline', url: "/about" },
    ],
    headers: [
      { title: 'ランキング', key: 'rank', sortable: false },
      { title: '', key: 'avatar', sortable: false },
      { title: 'ユーザー', key: 'name', sortable: false },
      { title: '職種', key: 'department', sortable: false },
      { title: '年齢', key: 'age', sortable: false },
      { title: 'ページ数', key: 'score', sortable: false },
    ],
    smHeaders: [
      { title: 'Rank', key: 'rank', sortable: false },
      { title: '', key: 'avatar', sortable: false },
      { title: 'User', key: 'name', sortable: false },
      { title: 'Pages', key: 'score', sortable: false },
    ],
    users: [
      { name: 's藤', score: 10, avatar: 'https://randomuser.me/api/portraits/women/1.jpg', rank: 0, age: 24, department: '営業' },
      { name: 's木', score: 20, avatar: 'https://randomuser.me/api/portraits/men/1.jpg', rank: 0, age: 30, department: '事務' },
      { name: 't橋', score: 30, avatar: 'https://randomuser.me/api/portraits/women/2.jpg', rank: 0, age: 45, department: 'アプリSE' },
      { name: 't中', score: 40, avatar: 'https://randomuser.me/api/portraits/men/2.jpg', rank: 0, age: 35, department: 'インフラSE' },
      { name: 'w辺', score: 50, avatar: 'https://randomuser.me/api/portraits/women/3.jpg', rank: 0, age: 40, department: '営業' },
      { name: 'i藤', score: 60, avatar: 'https://randomuser.me/api/portraits/men/3.jpg', rank: 0, age: 50, department: '事務' },
      { name: 'y本', score: 70, avatar: 'https://randomuser.me/api/portraits/women/4.jpg', rank: 0, age: 55, department: 'アプリSE' },
      { name: 'n村', score: 80, avatar: 'https://randomuser.me/api/portraits/men/4.jpg', rank: 0, age: 22, department: 'インフラSE' },
      { name: 'k林', score: 90, avatar: 'https://randomuser.me/api/portraits/women/5.jpg', rank: 0, age: 33, department: '営業' },
      { name: 'k藤', score: 100, avatar: 'https://randomuser.me/api/portraits/men/5.jpg', rank: 0, age: 44, department: '事務' },
      { name: 'y田', score: 110, avatar: 'https://randomuser.me/api/portraits/women/6.jpg', rank: 0, age: 25, department: 'アプリSE' },
      { name: 'y下', score: 120, avatar: 'https://randomuser.me/api/portraits/men/6.jpg', rank: 0, age: 36, department: 'インフラSE' },
      { name: 'ss木', score: 130, avatar: 'https://randomuser.me/api/portraits/women/7.jpg', rank: 0, age: 47, department: '営業' },
      { name: 'y口', score: 140, avatar: 'https://randomuser.me/api/portraits/men/7.jpg', rank: 0, age: 28, department: '事務' },
      { name: 'm本', score: 150, avatar: 'https://randomuser.me/api/portraits/women/8.jpg', rank: 0, age: 39, department: 'アプリSE' },
      { name: 'i上', score: 160, avatar: 'https://randomuser.me/api/portraits/men/8.jpg', rank: 0, age: 50, department: 'インフラSE' },
      { name: 'k村', score: 170, avatar: 'https://randomuser.me/api/portraits/women/9.jpg', rank: 0, age: 31, department: '営業' },
      { name: 'm林', score: 180, avatar: 'https://randomuser.me/api/portraits/men/9.jpg', rank: 0, age: 42, department: '事務' },
      { name: 's藤', score: 190, avatar: 'https://randomuser.me/api/portraits/women/10.jpg', rank: 0, age: 53, department: 'アプリSE' },
      { name: 's水', score: 200, avatar: 'https://randomuser.me/api/portraits/men/10.jpg', rank: 0, age: 34, department: 'インフラSE' },
      { name: 'いしくら', score: 0, avatar: '/img/ishikura.png', rank: 0, age: 26, department: 'インフラSE' },
    ].sort((a, b) => b.score - a.score),
    filteredUsers: [],
  }),
  mounted() {

    axios
      .get("http://localhost:3000/pages/0")
      .then((res) => {
        console.log(res.data)
        this.users[this.users.length - 1].score = res.data.pages
        this.users.sort((a, b) => b.score - a.score)
      })
      .then(() => {
        this.users.forEach((user, index) => {
          user.rank = index + 1;
        });
      })

  },
  methods: {
    filterByDepartment() {
      console.log("dp", this.selectedDepartment)
      if (this.selectedDepartment === 'すべて') {
        this.filteredUsers = this.users;
      } else {
        this.filteredUsers = this.users.filter(
          (user) => user.department === this.selectedDepartment
        );
      }
    },
    filterByAge() {
      if (this.selectedAge === '全年代') {
        this.filteredUsers = this.users;
      } else {
        this.filteredUsers = this.users.filter(
          (user) => user.age < this.ageMap[this.selectedAge] + 10 && user.age >= this.ageMap[this.selectedAge]
        );
      }
    },
    showRanking() {
      if (this.rankingDrawer) {
        this.rankingDrawer = false
      } else {
        axios
          .get("http://localhost:3000/pages/0")
          .then((res) => {
            console.log(res.data)
            for (let user of this.users) {
              if (user.name === 'いしくら') {
                user.score = res.data.pages
                break
              }
            }
            this.users.sort((a, b) => b.score - a.score)
          })
          .then(() => {
            this.users.forEach((user, index) => {
              user.rank = index + 1;
            });
            this.rankingDrawer = true
          })
      }
    },
  },
  created() {
    this.filteredUsers = this.users;
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #eeeeee;
}

.routerLink {
  color: aliceblue;
  text-decoration: none;
  justify-content: center;
}
</style>
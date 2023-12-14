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
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    drawer: false,
    items: [
      // { title: 'Home', icon: 'mdi-home' },
      { title: 'Book List', icon: 'mdi-book-open-page-variant', url: "/booklist" },
      { title: 'Read List', icon: 'mdi-checkbox-marked-outline', url: "/finishReading" },
      // { title: 'Ranking', icon: 'mdi-trophy-outline', url: "/about" },
    ],
  }),
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
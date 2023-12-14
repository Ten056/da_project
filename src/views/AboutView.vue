<template>
  <v-app>
    <v-container>
      <v-card>
        <v-card-title>Ranking</v-card-title>
        <v-card-text>
          <v-data-table :headers="headers" :items="users" :items-per-page="5" class="elevation-1">
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
    </v-container>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      headers: [
        { text: 'Rank', value: 'rank' },
        { text: 'Avatar', value: 'avatar' },
        { text: 'Name', value: 'name' },
        { text: 'Score', value: 'score' },
      ],
      users: [
        { name: 'User 1', score: 10, avatar: 'https://randomuser.me/api/portraits/women/1.jpg', rank: 0 },
        { name: 'User 2', score: 20, avatar: 'https://randomuser.me/api/portraits/men/1.jpg', rank: 0 },
        { name: 'User 3', score: 30, avatar: 'https://randomuser.me/api/portraits/women/2.jpg', rank: 0 },
        { name: 'User 4', score: 40, avatar: 'https://randomuser.me/api/portraits/men/2.jpg', rank: 0 },
        { name: 'User 5', score: 50, avatar: 'https://randomuser.me/api/portraits/women/3.jpg', rank: 0 },
        { name: 'User 6', score: 60, avatar: 'https://randomuser.me/api/portraits/men/3.jpg', rank: 0 },
        { name: 'User 7', score: 70, avatar: 'https://randomuser.me/api/portraits/women/4.jpg', rank: 0 },
        { name: 'User 8', score: 80, avatar: 'https://randomuser.me/api/portraits/men/4.jpg', rank: 0 },
        { name: 'User 9', score: 90, avatar: 'https://randomuser.me/api/portraits/women/5.jpg', rank: 0 },
        { name: 'User 10', score: 100, avatar: 'https://randomuser.me/api/portraits/men/5.jpg', rank: 0 },
        { name: 'User 11', score: 110, avatar: 'https://randomuser.me/api/portraits/women/6.jpg', rank: 0 },
        { name: 'User 12', score: 120, avatar: 'https://randomuser.me/api/portraits/men/6.jpg', rank: 0 },
        { name: 'User 13', score: 130, avatar: 'https://randomuser.me/api/portraits/women/7.jpg', rank: 0 },
        { name: 'User 14', score: 140, avatar: 'https://randomuser.me/api/portraits/men/7.jpg', rank: 0 },
        { name: 'User 15', score: 150, avatar: 'https://randomuser.me/api/portraits/women/8.jpg', rank: 0 },
        { name: 'User 16', score: 160, avatar: 'https://randomuser.me/api/portraits/men/8.jpg', rank: 0 },
        { name: 'User 17', score: 170, avatar: 'https://randomuser.me/api/portraits/women/9.jpg', rank: 0 },
        { name: 'User 18', score: 180, avatar: 'https://randomuser.me/api/portraits/men/9.jpg', rank: 0 },
        { name: 'User 19', score: 190, avatar: 'https://randomuser.me/api/portraits/women/10.jpg', rank: 0 },
        { name: 'User 20', score: 200, avatar: 'https://randomuser.me/api/portraits/men/10.jpg', rank: 0 },
      ].sort((a, b) => b.score - a.score),
    };
  },
  mounted() {
    this.users.forEach((user, index) => {
      user.rank = index + 1;
    });
  },
};
</script>
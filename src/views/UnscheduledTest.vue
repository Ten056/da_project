<template>
    <div class="parent">
        <div id="mainContents">
            <div class="box">
                <p style="font-size: 18px; font-weight:bold;">読書計画を作成しましょう。</p>
                <v-container class="container">
                    <v-row class="mt-4 container">
                        <v-col cols="600" md="200">
                            <div style="font-size: 18px; ">読了予定日: </div>
                        </v-col>
                        <v-col cols="600" md="200">
                            <v-text-field type="date" style="width:150px; margin-left:15px;" v-model="expectedDate" />
                        </v-col>
                        <v-col cols="600" md="200"></v-col>
                    </v-row>
                    <v-row class="container">
                        <v-col cols="600" md="200">
                            <div style="font-size:18px; margin-right:20px;">読めない日数:</div>
                        </v-col>
                        <v-col cols="600" md="200">
                            <v-text-field type="number" style="width:100px;  margin-right:10px;" min="0"
                                v-model="unreadDays" />
                        </v-col>
                        <v-col cols="600" md="200">
                            <div style="font-size: 18px;">日</div>
                        </v-col>
                    </v-row>
                </v-container>
                <v-btn v-on:click="submit" color="primary">登録</v-btn>
            </div>
        </div>
        <div id="table_id">
            <div class="box">
                <p style="font-size: 18px; font-weight:bold;">情報</p>
                <v-data-table :headers=none :items="boolks_table" density="compact" item-key="name"
                    class="my-table"></v-data-table>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { useRoute } from "vue-router";

export default {
    name: "test_page2",
    data: () => ({
        expectedDate: "",
        unreadDays: 0,
        route: useRoute(),
        path: "",
        todoData: "",
        books_list: "",
        select_id: "",
        boolks_table: [
            {
                name: '本のタイトル',
                value: 'title_value',
            },
            {
                name: '総ページ数',
                value: 'totalPage_value',
            }
        ]
    }),
    methods: {
        async submit() {
            if (this.expectedDate === "") {
                alert("読了予定日を入力してください")
                return
            }
            try {
                // 更新するデータのIDを取得する
                this.select_id = this.route.path.slice(this.route.path.length - 4, this.route.path.length - 3)
                console.log(this.todoData)

                // axiosでdb.jsonのデータを取得し、todoDataに格納
                const response = await axios.get("http://localhost:3000/books/" + this.select_id);
                this.todoData = response.data;

                // 今日の日付をyyyy-mm-dd形式で取得する
                let date = new Date()
                let y = date.getFullYear();
                let m = ("00" + (date.getMonth() + 1)).slice(-2);
                let d = ("00" + date.getDate()).slice(-2);
                date = [y, m, d].join("-");

                // 更新後データを定義
                let newData = {
                    startDate: date,
                    deadline: this.expectedDate,
                    unreadDays: this.unreadDays,
                    thumbnail: this.todoData.thumbnail,
                    title: this.todoData.title,
                    status: 0,
                    total_page: this.todoData.total_page
                }

                // db.jsonを更新
                await axios.put("http://localhost:3000/books/" + this.select_id, newData);
                console.log(response)

                // 画面遷移
                this.path = this.route.path.substr(0, this.route.path.length - 3)
                this.$router.push(this.path)
            } catch (error) {
                console.error(error);
            }
        },
    },
    mounted() {
        axios.get("http://localhost:3000/books")
            .then(response => {
                this.books_list = response.data;
                // データのIDを取得する
                this.select_id = this.route.path.slice(this.route.path.length - 4, this.route.path.length - 3)
                // 表の値を更新
                this.boolks_table[0].value = this.books_list[this.select_id].title
                this.boolks_table[1].value = this.books_list[this.select_id].total_page
            })
            .catch(error => console.log(error))
    },
};
</script>

<style scoped>
div#mainContents {
    /* 上 | 右 | 下 | 左 */
    margin: 0 0 0 5em;
    width: 50%;
    position: relative;

}

.container {
    justify-content: center;
    width: 450px;

}

.box {
    background-color: #f3f3f3;
    border-radius: 30px;
    padding: 10px;
    margin: 0 auto;
    width: 450px;
}

div#table_id {
    /* 上 | 右 | 下 | 左 */
    margin: 0 5em 0 0;
    width: 50%;
    position: relative;

}

.my-table {
    background-color: #f3f3f3;
}

.parent {
    display: flex;
}

/* スマートフォン用のスタイル */
@media (max-width: 600px) {
    div#mainContents {
        margin: 0 auto 0 auto;
        width: 500px;
        position: relative;

    }

    .container {
        justify-content: center;
        width: 450px;
    }

    .box {
        background-color: #f3f3f3;
        border-radius: 30px;
        padding: 10px;
        margin: 0 auto;
        width: 450px;
    }

    div#table_id {
        margin: 40px auto 0 auto;
        width: 500px;
        position: relative;

    }

    .my-table {
        background-color: #f3f3f3;
    }

    .parent {
        display: flex;
        flex-direction: column;
    }
}</style>
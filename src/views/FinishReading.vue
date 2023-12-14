<template>
    <div class="parent">
        <div id="leftContents">
            <div class="box">
                <h2>読了済み</h2>
                <v-container class="finish_container">
                    <v-row>
                        <v-col v-for="book in pagedBooks" :key="book.id" cols="4">
                            <v-card class="finish_book">
                                <v-img :src="book.thumbnail" height="200px" @click="navigateTo(book.id)"></v-img>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-pagination v-model="page" :length="totalPage" :total-visible="2" @input="changePage"></v-pagination>
                </v-container>
            </div>
        </div>
        <div id="rightContents">
            <div class="box">
                <h2>アクティビティ</h2>
                <v-table class="my-table" style="background-color: #f3f3f3;">
                    <tbody>
                        <tr v-for="item in books_table" :key="item.name">
                            <td width="250">{{ item.name }}</td>
                            <td style="text-align:left">{{ item.value }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </div>

        </div>
    </div>
</template>
  
<script>
import axios from 'axios'

export default {
    data() {
        return {
            page: 1,
            rowsPerPage: 9,
            todoData: [],
            books_table: [
                {
                    name: 'これまでに読んだ本の冊数',
                    value: 'total_books',
                },
                {
                    name: '今年読んだ本の冊数',
                    value: 'year_books',
                },
                {
                    name: '今月読んだ本の冊数',
                    value: 'month_books',
                }
            ]
        };
    },
    mounted() {
        axios.get("http://localhost:3000/books")
            .then(response => {
                let tmpData = response.data
                let tmpData_array = []
                let year_books = 0
                let month_books = 0
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;
                for (let i = 0; i < tmpData.length; i++) {
                    if (tmpData[i].total_page == tmpData[i].status) {
                        this.todoData.push(tmpData[i])
                        tmpData_array = tmpData[i].deadline.split('-')
                        // 今年読んだ本の冊数を計算
                        if (year == tmpData_array[0]) {
                            year_books = year_books + 1
                        }
                        // 今年かつ今月読んだ本の冊数を計算
                        if ((year == tmpData_array[0]) && (month == tmpData_array[1])) {
                            month_books = month_books + 1
                        }
                    }
                }
                // これまでに読んだ本の冊数
                this.books_table[0].value = this.todoData.length
                // 今年読んだ本の冊数
                this.books_table[1].value = year_books
                // 今年かつ今年読んだ本の冊数
                this.books_table[2].value = month_books
            })
    },
    computed: {
        totalPage() {
            return Math.ceil(this.todoData.length / this.rowsPerPage);
        },
        start() {
            return (this.page - 1) * this.rowsPerPage;
        },
        end() {
            return this.start + this.rowsPerPage;
        },
        pagedBooks() {
            return this.todoData.slice(this.start, this.end);
        },
    },
    methods: {
        changePage(page) {
            this.page = page;
        },
        navigateTo(data) {
            this.$router.push({ path: `/bookInfo/${data}` });
        },
    },
};
</script>
  
<style scoped>
.parent {
    display: flex;
}

div#leftContents {
    /* 上 | 右 | 下 | 左 */
    margin: 0 0 0 5em;
    width: 50%;
    position: relative;

}

div#rightContents {
    /* 上 | 右 | 下 | 左 */
    margin: 0 5em 0 0;
    width: 50%;
    position: relative;

}

.box {
    background-color: #f3f3f3;
    border-radius: 30px;
    padding: 10px;
    margin: 0 auto;
    width: 450px;
}

.finish_book {
    cursor: pointer;
}

/* スマートフォン用のスタイル */
@media (max-width: 600px) {
    .parent {
        display: flex;
        flex-direction: column;
    }

    div#leftContents {
        /* 上 | 右 | 下 | 左 */
        /* margin: 0 0 0 5em; */
        margin: 0 auto 0 auto;
        width: 500px;
        position: relative;

    }

    div#rightContents {
        /* 上 | 右 | 下 | 左 */
        /* margin: 0 5em 0 0; */
        margin: 40px auto 0 auto;
        width: 500px;
        position: relative;

    }

    .box {
        background-color: #f3f3f3;
        border-radius: 30px;
        padding: 10px;
        margin: 0 auto;
        width: 450px;
    }

    .finish_book {
        cursor: pointer;
    }
}</style>
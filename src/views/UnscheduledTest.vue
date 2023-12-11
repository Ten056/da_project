<template>
    <div id="mainContents"></div>
    <p>読書計画を作成しましょう</p>

    <!-- <table>
        <tr>
          <td>本のタイトル</td>
          <td class="td-left">「{{ bookData.title }}」</td>
        </tr>
        <tr>
          <td>総ページ数</td>
          <td class="td-left">{{ bookData.total_page }}ページ</td>
        </tr>
        </table> -->
    
    
    読了予定日: <input type="date" v-model="expectedDate">
    <br>
    読めない日数: <input type="number" min="0" style="width:50px" v-model="unreadDays">日
    <br>
    <button v-on:click="submit">登録</button>
</template>

<script>
import axios from 'axios';
import {useRoute} from "vue-router";

export default {
    name: "test_page2",
    data: () => ({
        expectedDate:"",
        unreadDays:0,
        route: useRoute(),
        path: "",
        todoData:"",
        select_id:""
    }),
    methods: {

       
        async submit() {
             if(this.expectedDate === ""){
            alert("読了予定日を入力してください")
            return }
        try {
            // 更新するデータのIDを取得する
            this.select_id = this.route.path.slice(this.route.path.length-4,this.route.path.length-3)
            console.log(this.todoData)
            
            // axiosでdb.jsonのデータを取得し、todoDataに格納
            const response = await axios.get("http://localhost:3000/books/"+this.select_id);
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
            await axios.put("http://localhost:3000/books/"+this.select_id,newData);
            console.log(response)

            // 画面遷移
            this.path = this.route.path.substr(0,this.route.path.length-3)
            this.$router.push(this.path)
        } catch (error) {
            console.error(error);
        } 
        },
    },
};
</script>

<style scoped>
div#mainContents{

    margin: 0 auto 0 auto;
    width:600px;

}

</style>
<template>
    <div id="mainContents"></div>
    <p>読書計画を作成しましょう</p>
    
    読了予定日: <input type="date" v-model="expectedDate">
    <br>
    読めない日数: <input type="number" min="0" style="width:50px" v-model="unreadDays">日
    <br>
    <button v-on:click="submit">登録</button>
</template>
<script>
 export default {
    name: "test_page2",
    data: () => ({
        expectedDate:"",
        unreadDays:""

    })
}


</script>

<style scoped>
div#mainContents{

    margin: 0 auto 0 auto;
    width:600px;

}

</style>
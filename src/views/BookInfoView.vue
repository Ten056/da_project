<script setup>
import { ref } from 'vue'
import axios from 'axios'

const userData = ref(null)
const bookData = ref(null)
const isData = ref(false)
const isHoverR = ref(false)
const isHoverT = ref(false)

function mouseHover(type) {
  if (type == 'r') {
    isHoverR.value = true
  } else {
    isHoverT.value = true
  }
}

function mouseLeave(type) {
  if (type == 'r') {
    isHoverR.value = false
  } else {
    isHoverT.value = false
  }
}

function getNowDate() {
  const dt = new Date()
  const y = dt.getFullYear()
  const m = ("00" + (dt.getMonth() + 1)).slice(-2)
  const d = ("00" + dt.getDate()).slice(-2)
  const result = y + '-' + m + '-' + d
  return result
}

function calcReadingRate(status, total_page) {
  return Math.round(100 * status / total_page)
}

function getDaysBetweenDate(dateStr1, dateStr2) {
  // 日付文字列をDateオブジェクトに変換
  const date1 = new Date(dateStr1)
  const date2 = new Date(dateStr2)

  // ミリ秒単位で差を求める
  const diff = Math.abs(date1.getTime() - date2.getTime())
  // ミリ秒を日数に変換
  const diffDays = diff / (1000 * 60 * 60 * 24) + 1
  console.log(diffDays)
  return diffDays
}

function getIdealReadingRate() {
  // 開始日から読了予定日までの日数
  let diffAllDays = getDaysBetweenDate(userData.value.startDate_0, userData.value.deadline_0)

  // 開始日から今日までの日数
  let diffToday = getDaysBetweenDate(userData.value.startDate_0, userData.value.today)

  if (diffAllDays <= diffToday) { // 予定では終了している場合
    userData.value.willReadingRate = 100
  } else {
    // 理想の進捗率を代入
    userData.value.willReadingRate = Math.round(100 * diffToday / diffAllDays)
  }

  // 読めない日数を引く
  diffAllDays -= userData.value.unreadDays_0

  if (diffAllDays <= diffToday) { // 理想では終了している場合
    userData.value.idealReadingRate = 100
  } else {
    // 理想の進捗率を代入
    userData.value.idealReadingRate = Math.round(100 * diffToday / diffAllDays)
  }
}

function getData() {
  // apiのURL
  const bookUrl = `http://localhost:3000/books/0`
  const userUrl = `http://localhost:3000/users/0`

  // data初期化
  bookData.value = null
  userData.value = null

  axios
    .get(bookUrl)
    .then((res) => {
      bookData.value = res.data
      return res.data
    })
    .then((data) => {// bookの情報を使うためthenを利用
      axios
        .get(userUrl)
        .then((res) => {
          userData.value = res.data
          userData.value.reading_rate = calcReadingRate(res.data.status_0, data.total_page)
          userData.value.today = getNowDate()
        })
        .then(() => {
          getIdealReadingRate()
        })
        .then(() => {
          isData.value = true
        })
    })
    .catch((error) => bookData.value = error)
}

getData()


import { Chart as ChartJS, ArcElement, Tooltip, Title, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
ChartJS.register(ArcElement, Tooltip, Title, Legend)

// チャート用のデータ
const data = (read, unread) => {
  return {
    labels: [
      '読んだページ数',
      '残りページ数'
    ],
    datasets: [{
      data: [read, unread],
      backgroundColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 222, 244)'
      ],
    }]
  }
};

// チャート描画のオプション
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: '　この本の読了率',
      font: {
        weight: 'bold',
        size: 30
      },
    },
    legend: {
      display: false,
      position: 'bottom',
      reverse: true,
      labels: {
        font: {
          size: 20
        }
      }
    },
  }
}



// ドーナツチャートの中央に表示させるプラグインを定義する
const ratioText = {
  id: 'ratio-text',
  beforeDraw(chart) {
    const { ctx, chartArea: { top, width, height } } = chart
    ctx.save()
    //チャート描画部分の中央を指定
    ctx.fillRect(width / 2, top + (height / 2), 0, 0)
    //フォントのスタイル指定
    ctx.font = 'bold 50px Roboto'
    ctx.fillStyle = '#333333'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    //80%という文字列をドーナツチャートの中央部に描画します
    ctx.fillText(userData.value.reading_rate + '%', width / 2, top + (height / 2))
  }
}



</script>

<template>
  <h1>あなたの読書計画</h1>
  <p v-if="!isData">Loading...</p>
  <div v-else>
    <div class="main-right-box">
      <div class="doughnut-graph">
        <Doughnut :data="data(userData.status_0, bookData.total_page - userData.status_0)" :options="options"
          :plugins="[ratioText]" />
      </div>
    </div>
    <div class="sub-right-box">
      <div class="progress-title">計画進捗率</div>
      <div class="progress-container">
        <div class="progress-bar-outer">
          <div class="progress-bar" :style="{ width: userData.reading_rate * 4 + 'px' }">
            <img src="img/turtle.png" class="icon" alt="Turtle" v-on:mouseover="mouseHover('t')"
              v-on:mouseleave="mouseLeave('t')" :style="{ left: (userData.willReadingRate * 4 - 20) + 'px' }">
            <div class="progress-label" :style="{ left: (userData.reading_rate * 4 - 20) + 'px' }">{{
              userData.reading_rate }} %</div>
            <img src="img/rabbit.svg" class="icon" alt="Rabbit" v-on:mouseover="mouseHover('r')"
              v-on:mouseleave="mouseLeave('r')" :style="{ left: (userData.idealReadingRate * 4 - 20) + 'px' }">
          </div>
          <div v-if="isHoverR" class="progress-r-label" :style="{ left: (userData.idealReadingRate * 4 - 20) + 'px' }">
            {{ userData.idealReadingRate }} %
          </div>
          <div v-if="isHoverT" class="progress-t-label" :style="{ left: (userData.willReadingRate * 4 - 20) + 'px' }">
            {{ userData.willReadingRate }} %
          </div>
        </div>
        <div class="progress-info">
          <div>
            <span class="start-date">開始日<br />12/1</span>
          </div>
          <div>
            <span class="end-date">読了日<br />12/30</span>
          </div>
        </div>
      </div>
    </div>
    <div class="info-left-box">
      <div class="table-title">情報</div>
      <table>
        <tr>
          <td>本のタイトル</td>
          <td class="td-left">「{{ bookData.title }}」</td>
        </tr>
        <tr>
          <td>総ページ数</td>
          <td class="td-left">{{ bookData.total_page }}ページ</td>
        </tr>
        <tr>
          <td>読んだページ数</td>
          <td class="td-left">{{ userData.status_0 }}ページ</td>
        </tr>
        <tr>
          <td>読書開始日</td>
          <td class="td-left">{{ userData.startDate_0 }}</td>
        </tr>
        <tr>
          <td>読了予定日</td>
          <td class="td-left">{{ userData.deadline_0 }}</td>
        </tr>
        <tr>
          <td>読めない日数</td>
          <td class="td-left">{{ userData.unreadDays_0 }}日</td>
        </tr>
        <tr>
          <td>読了率</td>
          <td class="td-left">{{ userData.reading_rate }}％</td>
        </tr>
        <tr>
          <td>理想の進捗率</td>
          <td class="td-left">{{ userData.idealReadingRate }}％</td>
        </tr>
        <tr>
          <td>最低限の進捗率</td>
          <td class="td-left">{{ userData.willReadingRate }}％</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<style scoped>
.doughnut-graph {
  width: 400px;
  height: 400px;
  position: absolute;
  margin-left: 10px;
}

.main-right-box {
  left: 53%;
  padding: 10px;
  margin-top: 10px;
  width: 440px;
  height: 440px;
  border-radius: 40px;
  background-color: rgb(244, 244, 244);
  position: absolute;
}

.sub-right-box {
  top: 660px;
  /* right: 10px; */
  left: 53%;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 40px;
  width: 440px;
  height: 250px;
  border-radius: 40px;
  background-color: rgb(244, 244, 244);
  position: absolute;
}

.info-left-box {
  right: 53%;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 440px;
  height: 500px;
  border-radius: 40px;
  background-color: rgb(244, 244, 244);
  position: absolute;
}

.progress-container {
  width: 420px;
  padding: 10px;
  margin-top: 80px;
}

.progress-title {
  margin-top: 10px;
  font-size: 30px;
  align-items: center;
  font-family: 'Robot';
  font-weight: 700;
  color: #666;
}

.progress-bar-outer {
  width: 100%;
  height: 20px;
  background-color: rgb(244, 235, 240);
  border: 1.5px solid rgb(255, 99, 132);
  box-sizing: border-box;
  position: relative;
  border-radius: 10px;
}

.progress-bar {
  width: 100%;
  background-color: rgb(255, 99, 132);
  height: 18.5px;
  position: relative;
  border-radius: 9px;
}

.progress-label {
  position: absolute;
  top: -35px;
  background-color: #666;
  color: white;
  padding: 5px;
  border-radius: 10px;
  width: 40px;
}

.progress-r-label {
  position: absolute;
  top: -60px;
  background-color: #666;
  color: white;
  padding: 5px;
  border-radius: 10px;
  width: 40px;
}

.progress-t-label {
  position: absolute;
  top: -60px;
  background-color: #666;
  color: white;
  padding: 5px;
  border-radius: 10px;
  width: 40px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.icon {
  position: absolute;
  width: 30px;
  bottom: 20px;
}

.start-date {
  font-family: 'Roboto';
  font-weight: 600;
  left: -30px
}

.end-date {
  font-family: 'Roboto';
  font-weight: 600;
  left: 30px
}

.table-title {
  margin-top: 10px;
  font-size: 30px;
  align-items: center;
  font-family: 'Robot';
  font-weight: 700;
  color: #666;
}

table {
  width: 400px;
  border-collapse: collapse;
  margin: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  color: black;
}

.td-left {
  text-align: center;
}
</style>
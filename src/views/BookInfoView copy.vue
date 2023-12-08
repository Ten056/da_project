<script setup>
import { ref } from 'vue'
import axios from 'axios'

const userData = ref(null)
const bookData = ref(null)
const isData = ref(false)

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
      text: 'Reading Chart',
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
  <h1>Vue 3でJSONを読み込むサンプル(簡易版)</h1>
  <p v-if="!isData">Loading...</p>
  <div v-else>
    <div class="main-right-box">
      <div class="doughnut-graph">
        <Doughnut :data="data(userData.status_0, bookData.total_page)" :options="options" :plugins="[ratioText]" />
      </div>
      <div class="progress-container">
        <div class="progress-bar" :style="{ width: userData.reading_rate + '%'}">
          <div class="progress-label">{{ userData.reading_rate }} %</div>
        </div>
        <div class="progress-info">
          <div class="start-date">
            <span class="icon">あ</span>
            <span>開始日 12/1</span>
          </div>
          <div class="end-date">
            <span class="icon">い</span>
            <span>読了日 12/30</span>
          </div>
        </div>
      </div>
    </div>
    <div>名前：{{ userData.name }}</div>
    <div>本1の状態：{{ userData.status_0 }}</div>
    <div>読書開始日：{{ userData.startDate_0 }}</div>
    <div>今日の日付：{{ userData.today }}</div>
    <div>読了予定日：{{ userData.deadline_0 }}</div>
    <div>読めない日数：{{ userData.unreadDays_0 }}</div>
    <div>タイトル：{{ bookData.title }}</div>
    <div>総ページ数：{{ bookData.total_page }}</div>
    <div>読了率：{{ userData.reading_rate }}％</div>
    <div>理想：{{ userData.idealReadingRate }}％</div>
    <div>予定：{{ userData.willReadingRate }}％</div>
  </div>
</template>

<style scoped>
.doughnut-graph {
  width: 400px;
  height: 400px;
  position: fixed;
}

.main-right-box {
  top: 0;
  right: 0;
  padding: 10px;
  background-color: aquamarine;
}

.progress-container {
  width: 100%;
  padding: 10px;
}

.progress-bar {
  background-color: blue;
  height: 20px;
  position: relative;
}

.progress-label {
  position: absolute;
  right: 0;
  top: -30px;
  background-color: #666;
  color: white;
  padding: 5px;
  border-radius: 10px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.icon {
  font-size: 1.5 rem;
}
</style>
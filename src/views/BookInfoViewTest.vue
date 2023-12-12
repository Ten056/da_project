<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRoute } from "vue-router";
// import Datepicker from '@vuepic/vue-datepicker'
// import '@vuepic/vue-datepicker/dist/main.css'

const route = useRoute();
let str = route.path;
let lastSlash = str.lastIndexOf('/');
let id = str.substring(lastSlash + 1);
console.log(id);

const userData = ref(null)
const bookData = ref(null)
const isData = ref(false)
const isHoverR = ref(false)
const isHoverT = ref(false)
const dialog = ref(false)
const inputDate = ref(getNowDate())
const inputCurrentPage = ref(null)

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
  let diffAllDays = getDaysBetweenDate(bookData.value.startDate, bookData.value.deadline)

  // 開始日から今日までの日数
  let diffToday = getDaysBetweenDate(bookData.value.startDate, userData.value.today)

  if (diffAllDays <= diffToday) { // 予定では終了している場合
    userData.value.willReadingRate = 100
  } else {
    // 理想の進捗率を代入
    userData.value.willReadingRate = Math.round(100 * diffToday / diffAllDays)
  }

  // 読めない日数を引く
  diffAllDays -= bookData.value.unreadDays

  if (diffAllDays <= diffToday) { // 理想では終了している場合
    userData.value.idealReadingRate = 100
  } else {
    // 理想の進捗率を代入
    userData.value.idealReadingRate = Math.round(100 * diffToday / diffAllDays)
  }
}

function getData() {
  // apiのURL
  const bookUrl = `http://localhost:3000/books/${id}`
  const userUrl = `http://localhost:3000/users/0`

  // data初期化
  // bookData.value = null
  // userData.value = null

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
          userData.value.reading_rate = calcReadingRate(data.status, data.total_page)
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


function isMobileView() {
  return window.innerWidth <= 600;  // 600pxをスマートフォンの閾値とします。
}

const fontRate = isMobileView() ? 0.7 : 1;  // スマートフォンでは80%に、それ以外では100%に設定
const barWidth = isMobileView() ? window.innerWidth * 0.75 : 420;  // スマートフォンでは80%に、それ以外では100%に設定
const circleLeft = isMobileView() ? 28 * window.innerWidth / 430 : 20;
const barLeft = isMobileView() ? window.innerWidth * 0.05 : 40;

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
      text: 'この本の読了率',
      font: {
        weight: 'bold',
        size: 30 * fontRate
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

const updateReadingDate = (bookData) => {
  axios.put(`http://localhost:3000/books/${id}`, bookData)
    .then(() => {
      getData()
    })
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
    ctx.font = `bold ${50 * fontRate}px Roboto`
    ctx.fillStyle = '#333333'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    //80%という文字列をドーナツチャートの中央部に描画します
    ctx.fillText(userData.value.reading_rate + '%', width / 2, top + (height / 2))
  }
}

const addRecord = (flag) => {
  if (flag) {
    console.log(inputDate)
    const tmpBooksData = {...bookData.value}
    console.log(tmpBooksData)
    tmpBooksData.status = inputCurrentPage.value
    updateReadingDate(tmpBooksData)
  }
  dialog.value = false;
}

</script>

<template>
  <h1>あなたの読書計画</h1>
  <p v-if="!isData">Loading...</p>
  <div v-else>
    <v-progress-linear
      model-value="100"
      color="red-darken-2"
      height="25"
      width="400"
      rounded
    ></v-progress-linear>
    <div class="main-right-box">
      <div class="doughnut-graph" :style="{ 'margin-left': circleLeft + 'px' }">
        <Doughnut :data="data(bookData.status, bookData.total_page - bookData.status)" :options="options"
          :plugins="[ratioText]" />
      </div>
    </div>
    <div class="sub-right-box">
      <div class="progress-title">
        <v-container>
          <span class="progress-title-content">計画進捗率</span>
          <v-btn @click="dialog = true" color="primary">
            実績入力
          </v-btn>
          <v-dialog v-model="dialog" width="80%" height="600px">
            <v-sheet>
              <v-sheet class="my-2 mx-5">
                <h2>実績を入力してください！</h2>
                <div>
                  <label for="inputDate">対象日：</label>
                  <input type="date" id="inputDate" name="inputDate" v-model="inputDate" />
                </div>
                <div>
                  <label for="inputDate">現在のページ：</label>
                  <input type="number" id="inputCurrentPage" placeholder="例）25ページ → 25" v-model="inputCurrentPage" />
                </div>
                <div class="d-flex justify-end my-2">
                  <v-btn class="mx-2" color="primary" @click="addRecord(true)">OK</v-btn>
                  <v-btn class="mx-2" color="error" @click="addRecord(false)">Cancel</v-btn>
                </div>
              </v-sheet>
            </v-sheet>
          </v-dialog>
        </v-container>
      </div>
      <div class="progress-container">
        <div class="progress-bar-outer">
          <div class="progress-bar" :style="{ width: userData.reading_rate * barWidth / 100 + 'px' }">
            <img src="/img/sadface.svg" class="icon" alt="Turtle" v-on:mouseover="mouseHover('t')"
              v-on:mouseleave="mouseLeave('t')"
              :style="{ left: (userData.willReadingRate * barWidth / 100 - barLeft) + 'px' }">
            <div class="progress-label" :style="{ left: (userData.reading_rate * barWidth / 100 - barLeft) + 'px' }">{{
              userData.reading_rate }} %</div>
            <img src="/img/smile.svg" class="icon" alt="Rabbit" v-on:mouseover="mouseHover('r')"
              v-on:mouseleave="mouseLeave('r')"
              :style="{ left: (userData.idealReadingRate * barWidth / 100 - barLeft) + 'px' }">
          </div>
          <div v-if="isHoverR" class="progress-r-label"
            :style="{ left: (userData.idealReadingRate * barWidth / 100 - barLeft) + 'px' }">
            {{ userData.idealReadingRate }} %
          </div>
          <div v-if="isHoverT" class="progress-t-label"
            :style="{ left: (userData.willReadingRate * barWidth / 100 - barLeft) + 'px' }">
            {{ userData.willReadingRate }} %
          </div>
        </div>
        <div class="progress-info">
          <div>
            <span class="start-date">開始日<br />{{ bookData.startDate }}</span>
          </div>
          <div>
            <span class="end-date">読了日<br />{{ bookData.deadline }}</span>
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
          <td class="td-left">{{ bookData.status }}ページ</td>
        </tr>
        <tr>
          <td>読書開始日</td>
          <td class="td-left">{{ bookData.startDate }}</td>
        </tr>
        <tr>
          <td>読了予定日</td>
          <td class="td-left">{{ bookData.deadline }}</td>
        </tr>
        <tr>
          <td>読めない日数</td>
          <td class="td-left">{{ bookData.unreadDays }}日</td>
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
  margin-left: 15px;
}

.main-right-box {
  top: 480px;
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
  text-align: center;
}

.progress-title-content {
  margin-right: 50px;
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
  text-align: center;
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

/* スマートフォン用のスタイル */
@media (max-width: 600px) {
  .doughnut-graph {
    width: 250px;
    height: 250px;
    margin-top: 10px;
  }


  .sub-right-box {
    width: 75%;
    left: 5%;
    right: 5%;
    top: 170px;
    /* margin-top: 20px; */
    margin: 0 auto;
  }

  .progress-container {
    width: 100%;
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
    text-align: center;
  }

  .progress-title-content {
  margin-right: 20px;
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
    /* position: relative; */
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
    font-size: small;
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

  .main-right-box {
    width: 75%;
    height: 300px;
    left: 5%;
    right: 5%;
    top: 460px;
    margin-top: 20px;
    margin: auto;
  }

  .info-left-box {
    width: 75%;
    height: 65%;
    left: 5%;
    right: 5%;
    top: 800px;
    margin: auto;
  }

  .progress-container {
    width: calc(100% - 20px);
  }

  .table-title,
  .progress-title {
    font-size: 24px;
  }

  table {
    width: calc(100% - 40px);
  }

  .icon {
    width: 25px;
  }

  h1 {
    text-align: center;
  }
}
</style>
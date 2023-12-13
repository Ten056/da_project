<script>
import axios from 'axios'
import { Chart as ChartJS, ArcElement, Tooltip, Title, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useRoute } from "vue-router";

export default {
  components: {
    Doughnut
  },
  setup() {
    const route = useRoute();
    const str = route.path;
    const lastSlash = str.lastIndexOf('/');
    const id = str.substring(lastSlash + 1);

    const userData = ref(null)
    const bookData = ref(null)
    const isData = ref(false)
    const isHoverR = ref(false)
    const isHoverT = ref(false)
    const dialog = ref(false)
    const inputDate = ref(getNowDate())
    const inputCurrentPage = ref(null)

    function getNowDate() {
      const dt = new Date()
      const y = dt.getFullYear()
      const m = ("00" + (dt.getMonth() + 1)).slice(-2)
      const d = ("00" + dt.getDate()).slice(-2)
      const result = y + '-' + m + '-' + d
      return result
    }

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

    // リアクティブなプロパティ
    const windowWidth = ref(window.innerWidth);

    // ウィンドウサイズの変更を監視
    watchEffect(() => {
      windowWidth.value = window.innerWidth;
    });

    // メソッド
    function isMobileView() {
      return windowWidth.value <= 600;
    }

    // コンピューテッドプロパティ
    const fontRate = computed(() => isMobileView() ? 0.7 : 1);
    const barHeight = computed(() => isMobileView() ? 60 : 30);

    // チャート用のデータとオプション
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

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'この本の読了率',
          font: {
            weight: 'bold',
            size: 30 * this.fontRate
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
    };

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
        ctx.font = `bold ${50 * this.fontRate}px Roboto`
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
        const tmpBooksData = { ...bookData.value }
        console.log(tmpBooksData)
        tmpBooksData.status = inputCurrentPage.value
        updateReadingDate(tmpBooksData)
      }
      dialog.value = false;
    }

    onMounted(() => {
      getData()
      ChartJS.register(ArcElement, Tooltip, Title, Legend)
    })

    return {
      // テンプレート内で使用するプロパティやメソッドを返します
      userData,
      bookData,
      isData,
      isHoverR,
      isHoverT,
      dialog,
      inputDate,
      inputCurrentPage,
      mouseHover,
      mouseLeave,
      getNowDate,
      calcReadingRate,
      getDaysBetweenDate,
      getIdealReadingRate,
      getData,
      isMobileView,
      data,
      options,
      updateReadingDate,
      ratioText,
      addRecord,
      barHeight,
      fontRate
    }
  }
}
</script>


<template>
  <h1>あなたの読書計画</h1>
  <p v-if="!isData">Loading...</p>
  <div v-else>
    <div class="main-right-box">
      <div class="doughnut-graph">
        <Doughnut :data="data(bookData.status, bookData.total_page - bookData.status)" :options="options"
          :plugins="[ratioText]" />
      </div>
    </div>
    <div class="sub-right-box">
      <div class="progress-title">
        <v-container>
          <span class="progress-title-content">計画進捗率</span>
          <v-btn @click="dialog = true" color="#1F4E79" class="mb-2">
            実績入力
          </v-btn>
          <v-dialog v-model="dialog" width="80%" height="600px">
            <v-sheet>
              <v-sheet class="my-2 mx-5">
                <h2>実績を入力してください！</h2>
                <v-container class="ma-2 pa-2">
                  <span>対象日</span>
                  <v-text-field v-model="inputDate" type="date" />
                  <span>現在のページ</span>
                  <v-text-field v-model="inputCurrentPage" placeholder="例）25ページ → 25" />
                </v-container>
                <div class="d-flex justify-end my-2">
                  <v-btn class="mx-2" color="#1F4E79" @click="addRecord(true)">OK</v-btn>
                  <v-btn class="mx-2" color="error" @click="addRecord(false)">Cancel</v-btn>
                </div>
              </v-sheet>
            </v-sheet>
          </v-dialog>
        </v-container>
      </div>
      <div class="progress-container">
        <div v-if="!isMobileView()">
          <img v-if="bookData.unreadDays !== 0" src="/img/sadface.svg" class="icon" alt="Turtle"
            v-on:mouseover="mouseHover('t')" v-on:mouseleave="mouseLeave('t')"
            :style="{ left: ((userData.willReadingRate - 50) * 4 - 15) + 'px' }">
          <img src="/img/smile.svg" class="icon" alt="Rabbit" v-on:mouseover="mouseHover('r')"
            v-on:mouseleave="mouseLeave('r')" :style="{ left: ((userData.idealReadingRate - 50) * 4 - 15) + 'px' }">
        </div>
        <div v-if="isHoverR" class="progress-r-label"
          :style="{ left: ((userData.idealReadingRate - 50) * 4 - 30) + 'px' }">
          {{ userData.idealReadingRate }} %
        </div>
        <div v-if="isHoverT" class="progress-t-label"
          :style="{ left: ((userData.willReadingRate - 50) * 4 - 30) + 'px' }">
          {{ userData.willReadingRate }} %
        </div>
        <v-progress-linear v-model="userData.reading_rate" color="#ff6384" :height="barHeight" rounded>
          <img v-if="isMobileView() && bookData.unreadDays !== 0" src="/img/sadface.svg" class="icon_sm" alt="Turtle"
            :style="{ left: `calc(${userData.willReadingRate}% - 20px)` }">
          <img v-if="isMobileView()" src="/img/smile.svg" class="icon_sm" alt="Rabbit"
            :style="{ left: `calc(${userData.idealReadingRate}% - 20px)` }">
          <strong class="rate">{{ userData.reading_rate }}%</strong>
        </v-progress-linear>
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
  margin: auto;
  margin-top: 10px;
}

.main-right-box {
  top: 450px;
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
  margin-top: 20px;
  overflow: visible;
}

.progress-title {
  margin-top: 10px;
  font-size: 30px;
  align-items: center;
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
  background-color: #666;
  color: white;
  padding: 5px;
  border-radius: 10px;
  width: 60px;
  font-size: medium;
  top: 60px;
  transform: translateX(220px);
}

.progress-t-label {
  position: absolute;
  background-color: #666;
  color: white;
  padding: 5px;
  border-radius: 10px;
  width: 60px;
  font-size: medium;
  top: 60px;
  transform: translateX(220px);
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
  top: 95px;
  transform: translateX(220px);
}

.start-date {
  font-weight: 600;
  left: -30px
}

.end-date {
  font-weight: 600;
  left: 30px
}

.table-title {
  margin-top: 10px;
  font-size: 30px;
  align-items: center;
  font-weight: 700;
  color: #666;
  text-align: center;
}

table {
  width: 400px;
  border-collapse: collapse;
  margin: auto;
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
  .icon_sm {
    position: absolute;
    width: 20px;
    /* transform: translateX(45vw); */
    margin-bottom: 25px;
  }

  .rate {
    margin-top: 25px;
  }

  .doughnut-graph {
    width: 250px;
    height: 250px;
    margin: auto;
    margin-top: 10px;
  }


  .sub-right-box {
    width: 90%;
    height: 270px;
    left: 5%;
    /* right: 5%; */
    top: 170px;
    padding: 0%;
    /* margin-top: 20px; */
    margin: 0 auto;
  }

  .progress-container {
    width: 100%;
    margin-top: 20px;
  }

  .progress-title {
    margin-top: 10px;
    font-size: 30px;
    align-items: center;
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

  .start-date {
    font-weight: 600;
    left: -30px
  }

  .end-date {
    font-weight: 600;
    left: 30px
  }

  /* .icon {
    position: absolute;
    width: 20px;
    top: 95px;
    transform: translateX(45vw);
  } */

  .table-title {
    margin-top: 10px;
    font-size: 30px;
    align-items: center;
    font-weight: 700;
    color: #666;
  }

  .main-right-box {
    height: 300px;
    width: 90%;
    left: 5%;
    /* right: 5%; */
    top: 460px;
    padding: 0%;
    /* margin-top: 20px; */
    margin: 0 auto;
  }

  .info-left-box {
    height: 500px;
    width: 90%;
    left: 5%;
    /* right: 5%; */
    top: 800px;
    padding: 0%;
    /* margin-top: 20px; */
    margin: 0 auto;
  }

  .table-title,
  .progress-title {
    font-size: 24px;
  }

  table {
    width: calc(100% - 40px);
  }

  h1 {
    text-align: center;
  }
}
</style>

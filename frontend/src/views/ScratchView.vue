<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const ticket = ref(null);
const isLoading = ref(false);
const message = ref('');

// 買彩券並取得資料
const buyTicket = async () => {
  if (authStore.user?.coins < 100) {
    alert('金幣不足，快去簽到領錢！');
    return;
  }

  isLoading.value = true;
  message.value = '';
  ticket.value = null;

  try {
    const res = await axios.post('https://shopping-backend-mdvl.onrender.com/api/games/scratch', {}, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    ticket.value = res.data.ticketData;
    message.value = res.data.message;
    
    // 更新右上角的金幣餘額
    authStore.user.coins = res.data.remainingCoins;
    localStorage.setItem('user', JSON.stringify(authStore.user));

  } catch (error) {
    alert(error.response?.data?.message || '購買失敗');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="scratch-container">
    <h2>🐎 金馬獎刮刮樂 (每張 $100 金幣)</h2>
    <p class="coins">目前金幣: 💰 {{ authStore.user?.coins || 0 }}</p>

    <button class="btn-buy" @click="buyTicket" :disabled="isLoading">
      {{ isLoading ? '正在發行彩券...' : '購買一張 (-100 金幣)' }}
    </button>

    <h3 v-if="message" class="result-msg">{{ message }}</h3>

    <div v-if="ticket" class="ticket-card">
      <div class="ticket-grid">
        
        <div class="game-zone game1">
          <h4>遊戲 1</h4>
          <p>刮出2個相同金額即得獎金</p>
          <div class="scratch-area" onclick="this.classList.add('revealed')">
            <span class="cover">點擊刮開</span>
            <div class="content">${{ ticket.game1[0] }} <br> ${{ ticket.game1[1] }}</div>
          </div>
        </div>

        <div class="game-zone game2">
          <h4>遊戲 2</h4>
          <p>刮出2個相同金額即得獎金</p>
          <div class="scratch-area" onclick="this.classList.add('revealed')">
            <span class="cover">點擊刮開</span>
            <div class="content">${{ ticket.game2[0] }} <br> ${{ ticket.game2[1] }}</div>
          </div>
        </div>

        <div class="game-zone game3">
          <h4>遊戲 3</h4>
          <p>刮出3個相同金額即得獎金</p>
          <div class="scratch-area" onclick="this.classList.add('revealed')">
            <span class="cover">點擊刮開</span>
            <div class="content">
              ${{ ticket.game3[0] }} | ${{ ticket.game3[1] }} <br> ${{ ticket.game3[2] }}
            </div>
          </div>
        </div>

        <div class="game-zone game4">
          <h4>幸運號碼 vs 您的號碼</h4>
          <div class="lucky-number">
             幸運號碼: <br> <strong>{{ ticket.luckyNumber }}</strong>
          </div>
          
          <div class="your-numbers">
            <div v-for="(item, index) in ticket.yourNumbers" :key="index" class="scratch-area small" onclick="this.classList.add('revealed')">
              <span class="cover">刮開</span>
              <div class="content">
                號碼: {{ item.number }}<br>
                <span class="prize">${{ item.prize }}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
.scratch-container { max-width: 800px; margin: 2rem auto; text-align: center; }
.coins { font-size: 1.2rem; font-weight: bold; color: #f39c12; }
.btn-buy { background: #e74c3c; color: white; padding: 10px 30px; border: none; border-radius: 30px; font-size: 1.2rem; cursor: pointer; margin: 1rem 0; box-shadow: 0 4px 6px rgba(231, 76, 60, 0.3); }
.btn-buy:hover { background: #c0392b; }
.result-msg { color: #d35400; font-size: 1.5rem; animation: pop 0.5s ease; }

/* 刮刮樂卡片佈局 */
.ticket-card { background: linear-gradient(135deg, #d32f2f, #b71c1c); border: 10px solid #ffd700; border-radius: 15px; padding: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); color: white; margin-top: 2rem; }
.ticket-grid { display: grid; grid-template-columns: 1fr 2fr 1fr; grid-template-rows: 1fr 1fr; gap: 15px; }

.game-zone { background: rgba(255,255,255,0.1); border: 2px dashed #ffd700; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.game-zone h4 { margin: 0 0 5px 0; color: #ffd700; }
.game-zone p { font-size: 0.8rem; margin: 0 0 10px 0; }

.game1 { grid-column: 1; grid-row: 1; }
.game2 { grid-column: 1; grid-row: 2; }
.game3 { grid-column: 3; grid-row: 1 / span 2; }
.game4 { grid-column: 2; grid-row: 1 / span 2; }

/* 暫時的「刮開」特效 (點擊翻牌) */
.scratch-area { position: relative; width: 100px; height: 60px; background: #fff; color: #333; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; overflow: hidden; }
.scratch-area.small { width: 80px; height: 80px; margin: 5px; }
.scratch-area .cover { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #bdc3c7; background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px); display: flex; align-items: center; justify-content: center; color: #555; transition: opacity 0.3s; z-index: 2; }
.scratch-area .content { opacity: 0; transition: opacity 0.3s; }

/* 點擊後隱藏銀色漆，顯示內容 */
.scratch-area.revealed .cover { opacity: 0; pointer-events: none; }
.scratch-area.revealed .content { opacity: 1; }

.your-numbers { display: flex; flex-wrap: wrap; justify-content: center; margin-top: 10px; }
.prize { color: #e74c3c; font-size: 1.1rem; }
.lucky-number { font-size: 1.2rem; background: #ffd700; color: #b71c1c; padding: 10px; border-radius: 50%; width: 60px; height: 60px; display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 0 auto; }
</style>
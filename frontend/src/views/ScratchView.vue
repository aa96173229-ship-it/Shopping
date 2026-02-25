<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import ScratchArea from '../components/ScratchArea.vue'; // 👈 引入我們剛剛寫的神奇元件

const authStore = useAuthStore();
const ticket = ref(null);
const isLoading = ref(false);
const message = ref('');

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
    <h2>🐎 金馬獎刮刮樂</h2>
    <!-- <p class="coins">目前金幣: 💰 {{ authStore.user?.coins || 0 }}</p> -->

    <button class="btn-buy" @click="buyTicket" :disabled="isLoading">
      {{ isLoading ? '發行中...' : '購買一張 ($100)' }}
    </button>

    <!-- <h3 v-if="message" class="result-msg">{{ message }}</h3> -->

    <div v-if="ticket" class="ticket-card">
      <div class="ticket-grid">
        
        <div class="game-zone game1">
          <div class="zone-title">🏆 遊戲 1</div>
          <p class="rule-text">刮出2個相同金額得獎</p>
          <ScratchArea class="scratch-box wide">
            <div class="prize-row">
              <span class="prize-text">${{ ticket.game1[0] }}</span>
              <span class="prize-text">${{ ticket.game1[1] }}</span>
            </div>
          </ScratchArea>
        </div>

       <div class="game-zone game2">
          <div class="zone-title">🧨 遊戲 2</div>
          <p class="rule-text">刮出2個相同金額得獎</p>
          
          <div class="game2-container">
            <ScratchArea class="scratch-box square">
              <span class="prize-text large">${{ ticket.game2[0] }}</span>
            </ScratchArea>
            
            <ScratchArea class="scratch-box square">
              <span class="prize-text large">${{ ticket.game2[1] }}</span>
            </ScratchArea>
          </div>
          </div>

        <div class="game-zone game3">
          <div class="zone-title">💰 遊戲 3</div>
          <p class="rule-text">刮出3個相同金額得獎</p>
          <ScratchArea class="scratch-box tall">
            <div class="prize-col">
              <span class="prize-text">${{ ticket.game3[0] }}</span>
              <span class="prize-text">${{ ticket.game3[1] }}</span>
              <span class="prize-text">${{ ticket.game3[2] }}</span>
            </div>
          </ScratchArea>
        </div>

        <div class="game-zone game4">
          <h4>幸運號碼 vs 您的號碼</h4>
          
          <div class="lucky-number">
             <span class="lucky-label">幸運號碼</span>
             <span class="lucky-val">{{ ticket.luckyNumber }}</span>
          </div>
          
          <div class="your-numbers">
            <ScratchArea v-for="(item, index) in ticket.yourNumbers" :key="index" class="scratch-box small">
              <div class="number-val">{{ item.number }}</div>
              <div class="prize-val">${{ item.prize }}</div>
            </ScratchArea>
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
.result-msg { color: #d35400; font-size: 1.5rem; animation: pop 0.5s ease; margin-bottom: 1rem; }

.ticket-card { background: linear-gradient(135deg, #d32f2f, #b71c1c); border: 10px solid #ffd700; border-radius: 15px; padding: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); color: white; }
.ticket-grid { display: grid; grid-template-columns: 1fr 2fr 1fr; grid-template-rows: 1fr 1fr; gap: 15px; }

.game-zone { background: rgba(255,255,255,0.1); border: 2px dashed #ffd700; border-radius: 10px; padding: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.game-zone h4 { margin: 0 0 5px 0; color: #ffd700; }
.game-zone p { font-size: 0.8rem; margin: 0 0 10px 0; }

.game1 { grid-column: 1; grid-row: 1; }
.game2 { grid-column: 1; grid-row: 2; }
.game3 { grid-column: 3; grid-row: 1 / span 2; }
.game4 { grid-column: 2; grid-row: 1 / span 2; }

/* 定義刮刮樂方塊的大小 */
.scratch-box { width: 100px; height: 60px; margin-top: 10px; }
.scratch-box.small { width: 80px; height: 80px; margin: 5px; }

/* --- 遊戲 1~3 的專屬排版 --- */
.zone-title {
  font-size: 1.2rem;
  font-weight: 900;
  color: #ffd700;
  margin-bottom: 3px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.rule-text {
  font-size: 0.85rem;
  color: #fff;
  margin: 0 0 8px 0;
  opacity: 0.9;
}

/* 讓遊戲1跟2的框框變寬，數字左右排 */
/* 修改這段：把原本的 130px 加寬 */
.scratch-box.wide { 
  width: 160px; /* 🌟 從 130px 改成 160px，給數字多一點空間 */
  height: 60px; 
}
/* 1. 修改這段：調整對齊方式並加入間距 */
.prize-row {
  display: flex;
  /* justify-content: space-evenly;  <-- 原本是這個，改成下面這樣 */
  justify-content: center; /* 讓兩個數字整體置中 */
  gap: 15px; /* 🌟 關鍵！強制在兩個數字中間插入 15px 的空隙 */
  align-items: center;
  width: 100%;
  height: 100%;
}

/* 2. 修改這段 (選用)：稍微把字體縮小一點點，避免金額很大時 (例如 $1000) 還是太擠 */
.prize-text {
  font-size: 1.2rem; /* 原本是 1.3rem，稍微改小一點點 */
  font-weight: 900;
  color: #2c3e50;
}

/* 讓兩個小方塊橫向排列，中間留點空隙 */
.game2-container {
  display: flex;
  gap: 15px; /* 方塊之間的距離 */
  justify-content: center;
  margin-top: 5px;
}

/* 定義新的「正方形」刮刮區大小 */
.scratch-box.square {
  width: 75px;
  height: 75px;
  /* 讓裡面的數字垂直置中 */
  display: flex;
  align-items: center;
  justify-content: center;
}


/* 讓遊戲3的框框變高，數字上下排 */
.scratch-box.tall { width: 90px; height: 110px; }
.prize-col {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 100%;
}

/* 統一中獎數字的樣式 */
.prize-text {
  font-size: 1.3rem;
  font-weight: 900;
  color: #2c3e50;
}

/* --- 遊戲 4 專屬排版優化 --- */
.your-numbers { 
  display: flex; 
  flex-wrap: wrap; 
  justify-content: center; 
  gap: 10px; /* 讓方塊之間有一點呼吸空間 */
  margin-top: 15px; 
}

/* 幸運號碼大圓圈 */
.lucky-number { 
  background: linear-gradient(135deg, #ffd700, #f39c12); 
  color: #b71c1c; 
  width: 95px; /* 把圓圈加大 */
  height: 95px; 
  border-radius: 50%; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  margin: 10px auto; 
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  border: 3px solid #fff; /* 加個白邊更有質感 */
}
.lucky-label { font-size: 0.85rem; font-weight: bold; margin-bottom: 2px; }
.lucky-val { font-size: 2.2rem; font-weight: 900; line-height: 1; }

/* 您的號碼數字排版 */
.number-val { font-size: 1.6rem; font-weight: 900; color: #2c3e50; line-height: 1.1; margin-top: 5px; }
.prize-val { color: #e74c3c; font-size: 1.1rem; font-weight: bold; }
@keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
/* =========================================
   📱 RWD 響應式排版 (平板與手機專屬陣型) 
========================================= */

/* 📟 第一階段：平板 (Tablet) - 螢幕寬度 900px 以下 */
@media (max-width: 900px) {
  .ticket-grid {
    grid-template-columns: 1fr 1fr; /* 從三欄變成「左右兩欄」 */
    grid-template-rows: auto;
  }
  
  /* 把佔地最廣的「遊戲 4 (對號碼)」移到最上面，並讓它橫跨兩欄 */
  .game4 { 
    grid-column: 1 / span 2; 
    grid-row: 1; 
  }
  
  /* 遊戲 1 跟 2 乖乖排在左邊的上下樓 */
  .game1 { grid-column: 1; grid-row: 2; }
  .game2 { grid-column: 1; grid-row: 3; }
  
  /* 遊戲 3 維持在右邊，並佔用兩層樓的高度 */
  .game3 { grid-column: 2; grid-row: 2 / span 2; }
}


/* 📱 第二階段：手機 (Mobile) - 螢幕寬度 600px 以下 */
@media (max-width: 600px) {
  .ticket-card {
    padding: 15px 10px; /* 縮小紅色外框的內邊距，把空間留給內容 */
  }

  .ticket-grid {
    display: flex; /* 放棄 Grid，改用 Flex 垂直堆疊，這在手機上最穩！ */
    flex-direction: column;
    gap: 20px;
  }

  /* 🌟 神來一筆：把遊戲 3 從「直長條」打平變成「橫長條」 */
  /* 如果在手機上還維持直的，會拉得太長，很難看 */
  .scratch-box.tall {
    width: 100%;
    max-width: 280px;
    height: 70px;
  }
  .prize-col {
    flex-direction: row; /* 裡面的三個數字改成「左右橫排」 */
    gap: 20px;
  }
}
</style>
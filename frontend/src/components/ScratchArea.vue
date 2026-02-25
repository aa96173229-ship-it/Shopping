<script setup>
import { ref, onMounted, nextTick } from 'vue';

const canvasRef = ref(null);
const wrapper = ref(null);
let ctx = null;
let lastPos = null; // 用來記錄滑鼠前一刻的位置，取代原本的 isDrawing

// 當這個小方塊出現在畫面上時，幫它塗上銀色漆
onMounted(async () => {
  await nextTick(); 
  initCanvas();
});

const initCanvas = () => {
  const canvas = canvasRef.value;
  ctx = canvas.getContext('2d');
  
  canvas.width = wrapper.value.clientWidth;
  canvas.height = wrapper.value.clientHeight;

  // 填滿銀色塗層
  ctx.fillStyle = '#bdc3c7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = '#7f8c8d';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('刮開', canvas.width / 2, canvas.height / 2);
};

// 取得滑鼠或手指的精準座標
const getMousePos = (e) => {
  const rect = canvasRef.value.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
};

// 滑鼠進入方塊 / 手指剛碰到螢幕 -> 記錄起點
const startHover = (e) => {
  lastPos = getMousePos(e);
};

// 滑鼠在方塊內移動 / 手指滑動 -> 直接開始刮！(不需要判斷是否按住左鍵)
const doScratch = (e) => {
  if (!lastPos) {
    lastPos = getMousePos(e);
  }
  const currentPos = getMousePos(e);
  
  ctx.globalCompositeOperation = 'destination-out'; 
  ctx.lineWidth = 25; // 🌟 筆刷調粗！一滑過去就看得很清楚
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(lastPos.x, lastPos.y);
  ctx.lineTo(currentPos.x, currentPos.y);
  ctx.stroke();

  // 更新最後位置
  lastPos = currentPos;
};

// 滑鼠離開方塊 / 手指離開螢幕 -> 清空位置，避免下次進來時產生奇怪的連線
const clearPos = () => {
  lastPos = null;
};
</script>

<template>
  <div class="scratch-wrapper" ref="wrapper">
    <div class="content">
      <slot></slot>
    </div>
    <canvas
      ref="canvasRef"
      class="scratch-canvas"
      @mouseenter="startHover"
      @mousemove="doScratch"
      @mouseleave="clearPos"
      @touchstart.prevent="startHover"
      @touchmove.prevent="doScratch"
      @touchend="clearPos"
    ></canvas>
  </div>
</template>

<style scoped>
.scratch-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  background: #fff;
  border-radius: 5px;
  overflow: hidden;
}
.content {
  font-weight: bold;
  text-align: center;
  color: #333;
}
.scratch-canvas {
  position: absolute;
  top: 0;
  left: 0;
  cursor: crosshair; 
  z-index: 2;
  border-radius: 5px;
}
</style>
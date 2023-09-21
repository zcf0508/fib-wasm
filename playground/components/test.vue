<script setup lang="ts">

import { sketchFilter } from 'fib-wasm'
import { ref, onMounted, nextTick } from 'vue'

const { sketchFilter3, sketchFilter4 } = new ComlinkWorker<typeof import('../workers/test.worker.ts')>(new URL('../workers/test.worker.ts', import.meta.url))

const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()

onMounted(() => {
  nextTick(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function(stream) {
          videoRef.value!.srcObject = stream;
          videoRef.value!.addEventListener('loadedmetadata', start);
        })
        .catch(function(error) {
          console.log('访问摄像头失败：', error);
        });
    } else {
      console.log('浏览器不支持WebRTC');
    }
  })
})

const mode = ref("1")

let temp: ImageData

function start() {
  const video = videoRef.value!
  const canvas = canvasRef.value!

  if (!video || video?.videoWidth === 0 || video?.videoHeight === 0) {
    // Video dimensions are not available yet, wait for the next frame
    requestAnimationFrame(start);
    return;
  } else {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')!

    const tCanvas = document.createElement('canvas')
    tCanvas.width = video.videoWidth
    tCanvas.height = video.videoHeight
    const tCtx = tCanvas.getContext('2d')!

    tCtx.drawImage(video, 0, 0, tCanvas.width, tCanvas.height)
    const imageData = tCtx.getImageData(0, 0, canvas.width, canvas.height)
    const data = new Uint8Array(imageData.data.buffer)

    // --- js
    if(mode.value === '1') {
      const res = sketchFilter2(data, canvas.width, canvas.height)
      const resImageData = new ImageData(new Uint8ClampedArray(res.buffer), canvas.width, canvas.height)
      ctx.putImageData(resImageData, 0, 0)
      requestAnimationFrame(start); // Call the function again for the next frame
    }

    // --- wasm
    if(mode.value === '2') {
      const res = sketchFilter(data, canvas.width, canvas.height)
      const resImageData = new ImageData(new Uint8ClampedArray(res.buffer), canvas.width, canvas.height)
      ctx.putImageData(resImageData, 0, 0)
      requestAnimationFrame(start); // Call the function again for the next frame
    }
    
    
    
    // --- worker
    if(mode.value === '3') {
      if(temp) {
        ctx.putImageData(temp, 0, 0)
      }
      sketchFilter3(data, canvas.width, canvas.height).then(res => {
        const resImageData = new ImageData(new Uint8ClampedArray(res.buffer), canvas.width, canvas.height)
        temp = resImageData
        ctx.putImageData(resImageData, 0, 0)
        requestAnimationFrame(start); // Call the function again for the next frame
      })
    }

    if(mode.value === '4') {
      if(temp) {
        ctx.putImageData(temp, 0, 0)
      }
      sketchFilter4(data, canvas.width, canvas.height).then(res => {
        const resImageData = new ImageData(new Uint8ClampedArray(res.buffer), canvas.width, canvas.height)
        temp = resImageData
        ctx.putImageData(resImageData, 0, 0)
        requestAnimationFrame(start); // Call the function again for the next frame
      })
    }
  }
}


function sketchFilter2(
  /** 当前需要渲染的帧 */
  data: Uint8Array, 
  width: number,
  height: number,
): Uint8Array {
  const length = data.length;

  // step 1 反色
  let layer1 = new Uint8Array(length);
  for (let i = 0; i < length; i += 4) {
    const r = Number(data[i]);
    const g = Number(data[i + 1]);
    const b = Number(data[i + 2]);
    const a = Number(data[i + 3]);

    layer1[i] = 255 - r;
    layer1[i + 1] = 255 - g;
    layer1[i + 2] = 255 - b;
    layer1[i + 3] = a;
  }

  // step 2 高斯模糊
  let layer2 = new Uint8Array(length);
  const kernel = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1],
  ];

  let r = 0 
  let g = 0 
  let b = 0
  let a = 0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      r = 0;
      g = 0;
      b = 0;
      a = 0;

      const pixelIndex = (y * width + x) * 4;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIndex2 = ((y + ky) * width + (x + kx)) * 4;
          const weight = kernel[ky + 1][kx + 1];
          r += data[pixelIndex2] * weight;
          g += data[pixelIndex2 + 1] * weight;
          b += data[pixelIndex2 + 2] * weight;
          a += data[pixelIndex2 + 3] * weight;
        }
      }

      const blurredPixelIndex = (y * width + x) * 4;
      layer2[blurredPixelIndex] = r >> 4;
      layer2[blurredPixelIndex + 1] = g >> 4;
      layer2[blurredPixelIndex + 2] = b >> 4;
      layer2[blurredPixelIndex + 3] = a >> 4;
    }
  }

  // step 3 合并 v=a.v+(a.v*b.v)/(255-b.v)

  let layer3 = new Uint8Array(length);
  for (let i = 0; i < length; i += 4) {
    const r = Number(layer1[i]);
    const g = Number(layer1[i + 1]);
    const b = Number(layer1[i + 2]);
    const a = Number(layer1[i + 3]);
    const r2 = Number(layer2[i]);
    const g2 = Number(layer2[i + 1]);
    const b2 = Number(layer2[i + 2]);

    layer3[i] = r + r2 * r / (255 - r2);
    layer3[i + 1] = g + g2 * g / (255 - g2);
    layer3[i + 2] = b + b2 * b / (255 - b2);
    layer3[i + 3] = 0xff;
  }

  return layer3;
}

</script>

<template>
  <div>
    <!-- 摄像头 -->
    <video ref="videoRef" width="640" height="480" autoplay></video>
    <canvas ref="canvasRef" width="640" height="480"/>
    <span>
      <input type="radio" id="radio_1" value="1" v-model="mode">
      <label for="radio_1">js</label>
    </span>
    <span>
      <input type="radio" id="radio_2" value="2" v-model="mode">
      <label for="radio_2">wasm</label>
    </span>
    <span>
      <input type="radio" id="radio_3" value="3" v-model="mode">
      <label for="radio_3">worker</label>
    </span>
    <span>
      <input type="radio" id="radio_4" value="4" v-model="mode">
      <label for="radio_4">wasm in worker</label>
    </span>
  </div>
</template>

<style scoped>

</style>
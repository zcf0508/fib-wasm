export function sketchFilter3(
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
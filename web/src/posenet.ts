import { load, PoseNet } from '@tensorflow-models/posenet';

let net: PoseNet | null = null;

load({
  architecture: 'MobileNetV1',
  outputStride: 16,
  inputResolution: 200,
  multiplier: 0.5,
}).then((n) => {
  net = n;
});

async function getPoseNet(): Promise<PoseNet> {
  return new Promise((resolve) => {
    const interval = setInterval(function () {
      if (net) {
        clearInterval(interval);
        resolve(net);
      }
    }, 200);
  });
}

export { getPoseNet };

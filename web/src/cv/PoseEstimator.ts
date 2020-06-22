import { Pose, Keypoint } from '@tensorflow-models/posenet';
import { Vector3, PerspectiveCamera, Matrix4 } from 'three';

import solveP3P from './solveP3P';
import KalmanFilter from './KalmanFilter';

const MEAN_IPD = 0.063;

const _left = new Vector3();
const _right = new Vector3();
const _nose = new Vector3();
const _v = new Vector3();

const _leftWorld = new Vector3(-MEAN_IPD / 2, 0.03175, -0.0254);
const _rightWorld = new Vector3(MEAN_IPD / 2, 0.03175, -0.0254);
const _noseWorld = new Vector3(0, 0, 0);

class PoseEstimator {
  imageHeight: number;
  imageWidth: number;
  camera: PerspectiveCamera;
  position: Vector3;
  orientation: Matrix4;
  _filters: Record<string, KalmanFilter>;

  constructor() {
    this.imageHeight = 1024;
    this.imageWidth = 768;
    this.camera = new PerspectiveCamera(
      78,
      this.imageWidth / this.imageHeight,
      0.1,
      100
    );
    this.position = new Vector3();
    this.orientation = new Matrix4();
    this._filters = {
      x: new KalmanFilter(),
      y: new KalmanFilter(),
      z: new KalmanFilter(),
    };
  }

  _normalizePixels(p: Vector3): Vector3 {
    p.x = (p.x / this.imageWidth) * 2 - 1;
    p.y = (p.y / this.imageHeight) * 2 - 1;
    return p;
  }

  setResolution({ width, height }: { width: number; height: number }) {
    this.imageWidth = width;
    this.imageHeight = height;
    this.camera.aspect = width / height;
  }

  update(pose: Pose) {
    const parts: Record<string, Keypoint> = {};
    for (const k of pose.keypoints) {
      parts[k.part] = k;
    }

    const nose = parts['nose'];
    const leftEye = parts['leftEye'];
    const rightEye = parts['rightEye'];
    _left.set(leftEye.position.x, leftEye.position.y, 0.5);
    _right.set(rightEye.position.x, rightEye.position.y, 0.5);
    _nose.set(nose.position.x, nose.position.y, 0.5);
    this._normalizePixels(_left).unproject(this.camera);
    this._normalizePixels(_right).unproject(this.camera);
    this._normalizePixels(_nose).unproject(this.camera);

    _left.sub(this.camera.position).normalize();
    _right.sub(this.camera.position).normalize();
    _nose.sub(this.camera.position).normalize();

    const solutions = solveP3P(
      _left,
      _right,
      _nose,
      _leftWorld,
      _rightWorld,
      _noseWorld
    );

    let minDistance = Infinity;
    let I = -1;
    for (let i = 0; i < solutions.length; i += 1) {
      const { c } = solutions[i];
      const d = _v.subVectors(c, this.position).length();
      if (d < minDistance) {
        I = i;
        minDistance = d;
      }
    }

    if (I === -1) {
      return;
    }

    const { c, R } = solutions[I];
    const x = this._filters.x.filter(c.x);
    const y = this._filters.y.filter(c.y);
    const z = this._filters.z.filter(c.z);

    this.position.set(x, y, z);
    const e = R.elements;
    this.orientation.set(
      e[0],
      e[1],
      e[2],
      0,
      e[3],
      e[4],
      e[5],
      0,
      e[6],
      e[7],
      e[8],
      0,
      0,
      0,
      0,
      1
    );
  }
}

export default PoseEstimator;

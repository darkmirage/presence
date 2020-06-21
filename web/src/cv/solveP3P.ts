import { Vector3, Matrix3 } from 'three';
import quartic from '@skymaker/quartic';

const _f1 = new Vector3();
const _f2 = new Vector3();
const _f3 = new Vector3();

const _p1 = new Vector3();
const _p2 = new Vector3();
const _p3 = new Vector3();

const v1 = new Vector3();
const v2 = new Vector3();

const e1 = new Vector3();
const e2 = new Vector3();
const e3 = new Vector3();

const n1 = new Vector3();
const n2 = new Vector3();
const n3 = new Vector3();

const c = new Vector3();

const T = new Matrix3();
const N = new Matrix3();
const N_T = new Matrix3();
const R = new Matrix3();

type Solution = {
  c: Vector3;
  R: Matrix3;
};

const solutions: Solution[] = [];
for (let i = 0; i < 4; i += 1) {
  solutions.push({
    c: new Vector3(),
    R: new Matrix3(),
  });
}

function updateT(f1: Vector3, f2: Vector3, f3: Vector3): Vector3 {
  e1.copy(f1);
  e3.crossVectors(f1, f2);
  e3.normalize();
  e2.crossVectors(e3, e1);

  T.set(e1.x, e1.y, e1.z, e2.x, e2.y, e2.z, e3.x, e3.y, e3.z);
  v1.copy(f3).applyMatrix3(T);
  return v1;
}

function solveP3P(
  f1: Vector3,
  f2: Vector3,
  f3: Vector3,
  p1: Vector3,
  p2: Vector3,
  p3: Vector3
): Solution[] {
  _f1.copy(f1);
  _f2.copy(f2);
  _f3.copy(f3);
  _p1.copy(p1);
  _p2.copy(p2);
  _p3.copy(p3);

  v1.subVectors(_p2, _p1);
  v2.subVectors(_p3, _p1);

  if (v2.cross(v1).length() === 0) {
    throw new Error('Colinear points');
  }

  _f3.copy(updateT(f1, f2, f3));

  if (_f3.z > 0) {
    _f3.copy(updateT(f2, f1, f3));

    _p1.copy(p2);
    _p2.copy(p1);
  }

  n1.subVectors(_p2, _p1).normalize();
  v1.subVectors(_p3, _p1);
  n3.crossVectors(n1, _f1).normalize();
  n2.crossVectors(n3, n1);

  N.set(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z, n3.x, n3.y, n3.z);

  _p3.copy(v1).applyMatrix3(N);

  v1.subVectors(p2, p1);
  const d_12 = v1.length();
  const f_1 = _f3.x / _f3.z;
  const f_2 = _f3.y / _f3.z;
  const p_1 = _p3.x;
  const p_2 = _p3.y;

  const cos_beta = _f1.dot(_f2);
  let b = 1 / (1 - Math.pow(cos_beta, 2)) - 1;

  if (cos_beta < 0) {
    b = -Math.sqrt(b);
  } else {
    b = Math.sqrt(b);
  }

  const f_1_pw2 = Math.pow(f_1, 2);
  const f_2_pw2 = Math.pow(f_2, 2);
  const p_1_pw2 = Math.pow(p_1, 2);
  const p_1_pw3 = p_1_pw2 * p_1;
  const p_1_pw4 = p_1_pw3 * p_1;
  const p_2_pw2 = Math.pow(p_2, 2);
  const p_2_pw3 = p_2_pw2 * p_2;
  const p_2_pw4 = p_2_pw3 * p_2;
  const d_12_pw2 = Math.pow(d_12, 2);
  const b_pw2 = Math.pow(b, 2);

  const factors0 = -f_2_pw2 * p_2_pw4 - p_2_pw4 * f_1_pw2 - p_2_pw4;

  const factors1 =
    2 * p_2_pw3 * d_12 * b +
    2 * f_2_pw2 * p_2_pw3 * d_12 * b -
    2 * f_2 * p_2_pw3 * f_1 * d_12;

  const factors2 =
    -f_2_pw2 * p_2_pw2 * p_1_pw2 -
    f_2_pw2 * p_2_pw2 * d_12_pw2 * b_pw2 -
    f_2_pw2 * p_2_pw2 * d_12_pw2 +
    f_2_pw2 * p_2_pw4 +
    p_2_pw4 * f_1_pw2 +
    2 * p_1 * p_2_pw2 * d_12 +
    2 * f_1 * f_2 * p_1 * p_2_pw2 * d_12 * b -
    p_2_pw2 * p_1_pw2 * f_1_pw2 +
    2 * p_1 * p_2_pw2 * f_2_pw2 * d_12 -
    p_2_pw2 * d_12_pw2 * b_pw2 -
    2 * p_1_pw2 * p_2_pw2;

  const factors3 =
    2 * p_1_pw2 * p_2 * d_12 * b +
    2 * f_2 * p_2_pw3 * f_1 * d_12 -
    2 * f_2_pw2 * p_2_pw3 * d_12 * b -
    2 * p_1 * p_2 * d_12_pw2 * b;

  const factors4 =
    -2 * f_2 * p_2_pw2 * f_1 * p_1 * d_12 * b +
    f_2_pw2 * p_2_pw2 * d_12_pw2 +
    2 * p_1_pw3 * d_12 -
    p_1_pw2 * d_12_pw2 +
    f_2_pw2 * p_2_pw2 * p_1_pw2 -
    p_1_pw4 -
    2 * f_2_pw2 * p_2_pw2 * p_1 * d_12 +
    p_2_pw2 * f_1_pw2 * p_1_pw2 +
    f_2_pw2 * p_2_pw2 * d_12_pw2 * b_pw2;

  const roots = quartic.solve(factors0, factors1, factors2, factors3, factors4);
  const realRoots = roots.map((r) => r.re);

  N_T.copy(N).transpose();

  for (let i = 0; i < 4; i += 1) {
    const cot_alpha =
      ((-f_1 * p_1) / f_2 - realRoots[i] * p_2 + d_12 * b) /
      ((-f_1 * realRoots[i] * p_2) / f_2 + p_1 - d_12);

    const cos_theta = realRoots[i];
    const sin_theta = Math.sqrt(1 - Math.pow(realRoots[i], 2));
    const sin_alpha = Math.sqrt(1 / (Math.pow(cot_alpha, 2) + 1));
    let cos_alpha = Math.sqrt(1 - Math.pow(sin_alpha, 2));

    if (cot_alpha < 0) {
      cos_alpha = -cos_alpha;
    }

    c.set(
      d_12 * cos_alpha * (sin_alpha * b + cos_alpha),
      cos_theta * d_12 * sin_alpha * (sin_alpha * b + cos_alpha),
      sin_theta * d_12 * sin_alpha * (sin_alpha * b + cos_alpha)
    );

    c.applyMatrix3(N_T).add(p1);

    R.set(
      -cos_alpha,
      -sin_alpha * cos_theta,
      -sin_alpha * sin_theta,
      sin_alpha,
      -cos_alpha * cos_theta,
      -cos_alpha * sin_theta,
      0,
      -sin_theta,
      cos_theta
    );

    R.transpose();
    R.premultiply(N_T);
    R.multiply(T);

    const solution = solutions[i];
    solution.c.copy(c);
    solution.R.copy(R);
  }

  return solutions;
}

export default solveP3P;

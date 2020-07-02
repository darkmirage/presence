import { Camera, Vector3, Matrix4 } from 'three';

class OffAxisCamera extends Camera {
  private pa: Vector3;
  private pb: Vector3;
  private pc: Vector3;

  private vr: Vector3;
  private vu: Vector3;
  private vn: Vector3;

  private va: Vector3;
  private vb: Vector3;
  private vc: Vector3;

  private MT: Matrix4;
  private T: Matrix4;

  near: number;
  far: number;

  constructor(
    pa: Vector3,
    pb: Vector3,
    pc: Vector3,
    near: number = 0.1,
    far: number = 2000
  ) {
    super();

    this.type = 'OffAxisCamera';

    this.pa = new Vector3();
    this.pb = new Vector3();
    this.pc = new Vector3();

    this.vr = new Vector3();
    this.vu = new Vector3();
    this.vn = new Vector3();

    this.va = new Vector3();
    this.vb = new Vector3();
    this.vc = new Vector3();

    this.MT = new Matrix4();
    this.T = new Matrix4();

    const t = this.T.elements;
    t[0] = 1;
    t[1] = 0;
    t[2] = 0;
    t[3] = 0;

    t[4] = 0;
    t[5] = 1;
    t[6] = 0;
    t[7] = 0;

    t[8] = 0;
    t[9] = 0;
    t[10] = 1;
    t[11] = 0;
    t[15] = 1;

    this.near = near;
    this.far = far;

    this.setScreenPoints(pa, pb, pc);

    this.updateProjectionMatrix();
    (window as any).camera = this;
  }

  setScreenPoints(pa: Vector3, pb: Vector3, pc: Vector3) {
    this.pa.copy(pa);
    this.pb.copy(pb);
    this.pc.copy(pc);

    const { vr, vu, vn } = this;

    vr.subVectors(pb, pa).normalize();
    vu.subVectors(pc, pa).normalize();
    vn.crossVectors(vr, vu).normalize();

    const m = this.MT.elements;
    m[0] = vr.x;
    m[4] = vr.y;
    m[8] = vr.z;
    m[12] = 0;
    m[1] = vu.x;
    m[5] = vu.y;
    m[9] = vu.z;
    m[13] = 0;
    m[2] = vn.x;
    m[6] = vn.y;
    m[10] = vn.z;
    m[14] = 0;
    m[3] = 0;
    m[7] = 0;
    m[11] = 0;
    m[15] = 1;
  }

  updateProjectionMatrix() {
    const { vn, vr, vu, va, vb, vc, pa, pb, pc, near, far, position } = this;

    const t = this.T.elements;
    t[12] = -position.x;
    t[13] = -position.y;
    t[14] = -position.z;

    va.subVectors(pa, position);
    vb.subVectors(pb, position);
    vc.subVectors(pc, position);

    const d = -vn.dot(va);
    const left = (vr.dot(va) * near) / d;
    const right = (vr.dot(vb) * near) / d;
    const bottom = (vu.dot(va) * near) / d;
    const top = (vu.dot(vc) * near) / d;

    this.projectionMatrix.makePerspective(left, right, top, bottom, near, far);
    this.projectionMatrix.multiply(this.MT);
    this.projectionMatrix.multiply(this.T);

    this.projectionMatrixInverse.getInverse(this.projectionMatrix);
  }
}

export default OffAxisCamera;

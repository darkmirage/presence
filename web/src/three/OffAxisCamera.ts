import { Camera, MathUtils } from 'three';

class OffAxisCamera extends Camera {
  fov: number;
  zoom: number;
  near: number;
  far: number;
  focus: number;
  aspect: number;
  filmGauge: number;
  filmOffset: number;

  constructor(
    fov: number = 50,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 2000
  ) {
    super();

    this.type = 'OffAxisCamera';

    this.fov = fov !== undefined ? fov : 50;
    this.zoom = 1;

    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 2000;
    this.focus = 10;

    this.aspect = aspect !== undefined ? aspect : 1;

    this.filmGauge = 35; // width of the film (default in millimeters)
    this.filmOffset = 0; // horizontal film offset (same unit as gauge)

    this.updateProjectionMatrix();
    (window as any).camera = this;
  }

  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }

  updateProjectionMatrix() {
    let near = this.near,
      top = (near * Math.tan(MathUtils.DEG2RAD * 0.5 * this.fov)) / this.zoom,
      height = 2 * top,
      width = this.aspect * height,
      left = -0.5 * width;

    const skew = this.filmOffset;
    if (skew !== 0) left += (near * skew) / this.getFilmWidth();

    this.projectionMatrix.makePerspective(
      left,
      left + width,
      top,
      top - height,
      near,
      this.far
    );

    this.projectionMatrixInverse.getInverse(this.projectionMatrix);
  }
}

export default OffAxisCamera;

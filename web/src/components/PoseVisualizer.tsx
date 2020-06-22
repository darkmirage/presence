import React from 'react';
import { Pose } from '@tensorflow-models/posenet';
import { createUseStyles } from 'react-jss';
import {
  WebGLRenderer,
  Scene,
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  Color,
  Fog,
  PlaneBufferGeometry,
  HemisphereLight,
  MeshPhongMaterial,
  GridHelper,
  PerspectiveCamera,
  CameraHelper,
} from 'three';

import PoseEstimator from '../cv/PoseEstimator';

type Props = {
  pose: Pose;
  estimator: PoseEstimator;
};

function createCube(scene: Scene): Mesh {
  const geometry = new BoxGeometry(0.2, 0.2, 0.2);
  const material = new MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new Mesh(geometry, material);
  scene.add(cube);
  return cube;
}

const PoseVisualizer = (props: Props) => {
  const { pose, estimator } = props;
  const classes = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);

  const [renderer] = React.useState<WebGLRenderer>(
    () => new WebGLRenderer({ antialias: false })
  );
  const [camera] = React.useState<PerspectiveCamera>(
    () => new PerspectiveCamera()
  );
  const [scene] = React.useState<Scene>(() => {
    const s = new Scene();
    s.background = new Color(0xa0a0a0);
    s.fog = new Fog(0xa0a0a0, 10, 20);
    const ground = new Mesh(
      new PlaneBufferGeometry(2000, 2000),
      new MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    s.add(ground);
    const grid = new GridHelper(100, 100, 0x000000, 0x000000);
    s.add(grid);
    const hemiLight = new HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 200, 0);
    s.add(hemiLight);
    const helper = new CameraHelper(estimator.camera);
    s.add(estimator.camera);
    s.add(helper);
    return s;
  });
  const [cube] = React.useState<Mesh>(() => createCube(scene));

  React.useEffect(() => {
    if (ref.current && ref.current.children.length === 0) {
      camera.position.set(-2, 1, 2);
      camera.lookAt(0, 0, 0);
      ref.current.appendChild(renderer.domElement);
      renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
    }
  }, [pose, camera, renderer]);

  React.useEffect(() => {
    if (!pose) {
      return;
    }

    cube.position.copy(estimator.position);
    cube.rotation.setFromRotationMatrix(estimator.orientation);

    renderer.render(scene, camera);
  }, [estimator, camera, cube, renderer, scene, pose]);

  if (!pose) {
    return null;
  }

  return <div className={classes.PoseVisualizer} ref={ref} />;
};

const useStyles = createUseStyles({
  PoseVisualizer: {
    width: 400,
    height: 400,
  },
});

export default PoseVisualizer;

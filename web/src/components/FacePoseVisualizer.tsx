import React from 'react';
import { createUseStyles } from 'react-jss';
import {
  AmbientLight,
  Color,
  CubeTextureLoader,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export type FacePose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};

type Props = {
  pose: FacePose;
};

const path =
  'https://wireplace-assets.s3-us-west-1.amazonaws.com/presence/textures/cube/Park2/';
const format = '.jpg';
const envMap = new CubeTextureLoader().load([
  path + 'posx' + format,
  path + 'negx' + format,
  path + 'posy' + format,
  path + 'negy' + format,
  path + 'posz' + format,
  path + 'negz' + format,
]);

function loadAvatar(scene: Scene): Object3D {
  const obj = new Object3D();
  const loader = new GLTFLoader();
  loader
    .loadAsync(
      'https://wireplace-assets.s3-us-west-1.amazonaws.com/presence/models/gltf/StormtrooperHelmet/scene.gltf'
    )
    .then((gltf) => {
      const model = gltf.scene;

      model.traverse(function (child: Mesh) {
        if (child.isMesh)
          (child.material as MeshStandardMaterial).envMap = envMap;
      });

      obj.add(model);
    });
  scene.add(obj);
  return obj;
}

const FacePoseVisualizer = (props: Props) => {
  const { pose } = props;
  const classes = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);

  const [renderer] = React.useState<WebGLRenderer>(
    () => new WebGLRenderer({ antialias: true })
  );
  const [camera] = React.useState<PerspectiveCamera>(
    () => new PerspectiveCamera()
  );
  const [scene] = React.useState<Scene>(() => {
    const s = new Scene();
    s.background = new Color(0x131516);
    const hemiLight = new HemisphereLight(0xffffff, 0x444444, 2.5);
    hemiLight.position.set(-100, 100, 100);
    const leftLight = new PointLight(0x0033ee, 0.3);
    leftLight.position.set(4, 1.5, 2.0);
    const ambLight = new AmbientLight(0xffffff, 0.4);
    s.add(ambLight);
    s.add(leftLight);
    s.add(hemiLight);
    return s;
  });
  const [face] = React.useState(() => loadAvatar(scene));

  React.useEffect(() => {
    if (ref.current && ref.current.children.length === 0) {
      camera.position.set(0, 0.3, 0.5);
      ref.current.appendChild(renderer.domElement);
      renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
    }
  }, [pose, camera, renderer]);

  React.useEffect(() => {
    face.position.set(pose.x, pose.y, pose.z);
    face.rotation.set(pose.rx, pose.ry, pose.rz);
    const cameraY = face.position.y + 0.25;
    camera.position.setY(cameraY);
    camera.lookAt(0, cameraY, 0);

    renderer.render(scene, camera);
  }, [camera, face, renderer, scene, pose]);

  if (!pose) {
    return null;
  }

  return <div className={classes.FacePoseVisualizer} ref={ref} />;
};

const useStyles = createUseStyles({
  FacePoseVisualizer: {
    width: 400,
    height: 400,
  },
});

export default FacePoseVisualizer;

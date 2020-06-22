import React from 'react';
import { Pose } from '@tensorflow-models/posenet';
import { createUseStyles } from 'react-jss';
import { Slider } from '@blueprintjs/core';
import {
  AnimationMixer,
  Clock,
  Color,
  CubeTextureLoader,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  sRGBEncoding,
  WebGLRenderer,
} from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

import PoseEstimator from '../cv/PoseEstimator';

type Props = {
  pose: Pose;
  estimator: PoseEstimator;
};

type SceneObjects = {
  scene: Scene;
  camera: PerspectiveCamera;
  update: () => void;
  clock: Clock;
};

function initializeScene(): SceneObjects {
  const clock = new Clock();
  const scene = new Scene();
  scene.background = new Color(0x181a1b);
  scene.fog = new Fog(0x181a1b, 20, 200);

  const hemiLight = new HemisphereLight(0xffffff, 0x000000, 0.4);
  scene.add(hemiLight);

  const dirLight = new DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 2, 8);
  scene.add(dirLight);

  const camera = new PerspectiveCamera(45, 1, 0.1, 2000);
  const cameraContainer = new Object3D();
  cameraContainer.add(camera);
  scene.add(cameraContainer);
  cameraContainer.position.set(0, 0, 0.6);

  const plane = new Mesh(
    new PlaneBufferGeometry(100, 100),
    new MeshPhongMaterial({ color: 0x999999, specular: 0x101010 })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  // scene.add(plane);

  let mixer: AnimationMixer | null = null;

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

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    'https://wireplace-assets.s3-us-west-1.amazonaws.com/presence/js/libs/draco/gltf/'
  );

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader
    .loadAsync(
      'https://wireplace-assets.s3-us-west-1.amazonaws.com/presence/models/gltf/LittlestTokyo.glb'
    )
    .then((gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(0.0005, 0.0005, 0.0005);
      model.rotation.set(0, Math.PI / 4, 0);
      model.traverse(function (child: Mesh) {
        if (child.isMesh)
          (child.material as MeshStandardMaterial).envMap = envMap;
      });

      scene.add(model);

      mixer = new AnimationMixer(model);
      mixer.clipAction(gltf.animations[0]).play();
    });

  function update() {
    const deltaTime = clock.getDelta();
    mixer?.update(deltaTime);
  }

  return { scene, camera, update, clock };
}

const ParallaxScene = (props: Props) => {
  const { pose, estimator } = props;
  const classes = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);

  const [objects] = React.useState(initializeScene);
  const [renderer] = React.useState<WebGLRenderer>(() => {
    const renderer = new WebGLRenderer({ antialias: true });
    renderer.outputEncoding = sRGBEncoding;
    return renderer;
  });
  const [xCoeff, setXCoeff] = React.useState(0.15);
  const [yCoeff, setYCoeff] = React.useState(0.15);
  const [showSlider, setShowSlider] = React.useState(false);

  React.useEffect(() => {
    if (ref.current && ref.current.children.length === 0) {
      ref.current.appendChild(renderer.domElement);
      renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      objects.camera.aspect =
        ref.current.clientWidth / ref.current.clientHeight;
      objects.camera.updateProjectionMatrix();
    }
  }, [pose, objects, renderer]);

  React.useEffect(() => {
    let running = true;
    const { scene, camera, update } = objects;

    const animate = () => {
      update();
      camera.position.x = estimator.midpoint.x * xCoeff;
      camera.position.y = -estimator.midpoint.y * yCoeff;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);

      if (running) {
        requestAnimationFrame(animate);
      }
    };
    animate();
    return () => {
      running = false;
    };
  }, [renderer, objects, estimator, xCoeff, yCoeff]);

  const sliders = showSlider ? (
    <>
      <div>
        {xCoeff.toFixed(2)}
        <Slider
          value={xCoeff}
          stepSize={0.01}
          onChange={setXCoeff}
          vertical
          max={0.2}
          labelRenderer={false}
        />
      </div>
      <div>
        {yCoeff.toFixed(2)}
        <Slider
          value={yCoeff}
          stepSize={0.01}
          onChange={setYCoeff}
          vertical
          max={0.2}
          labelRenderer={false}
        />
      </div>
    </>
  ) : null;

  return (
    <>
      <div
        className={classes.ParallaxScene}
        ref={ref}
        onClick={() => setShowSlider(!showSlider)}
      />
      {sliders}
    </>
  );
};

const useStyles = createUseStyles({
  ParallaxScene: {
    width: 400,
    height: 400,
    marginRight: 12,
  },
});

export default ParallaxScene;

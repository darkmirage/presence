import {
  AmbientLight,
  Color,
  CubeTextureLoader,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  Scene,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const path =
  'https://wireplace-assets.s3-us-west-1.amazonaws.com/presence/textures/cube/Park2/';
const format = '.jpg';
export const envMap = new CubeTextureLoader().load([
  path + 'posx' + format,
  path + 'negx' + format,
  path + 'posy' + format,
  path + 'negy' + format,
  path + 'posz' + format,
  path + 'negz' + format,
]);

export function loadAvatar(scene: Scene): Object3D {
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

export function createDefaultScene(): Scene {
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
}

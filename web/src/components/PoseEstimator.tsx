import React from 'react';
import { PoseNet, Pose } from '@tensorflow-models/posenet';
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
import Stats from 'stats.js';

import getPoseNet from '../cv/getPoseNet';
import Estimator from '../cv/PoseEstimator';

const stats = new Stats();
stats.showPanel(0);

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
};

function createCube(scene: Scene): Mesh {
  const geometry = new BoxGeometry(0.2, 0.2, 0.2);
  const material = new MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new Mesh(geometry, material);
  scene.add(cube);
  return cube;
}

const PoseEstimator = (props: Props) => {
  const { videoRef } = props;
  const classes = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);
  const [net, setNet] = React.useState<PoseNet | null>(null);
  const [pose, setPose] = React.useState<Pose | null>(null);
  const [estimator] = React.useState(() => new Estimator());

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
    document.body.appendChild(stats.dom);

    getPoseNet().then((n) => {
      setNet(n);
    });
  }, []);

  React.useEffect(() => {
    if (ref.current) {
      camera.position.set(-2, 1, 2);
      camera.lookAt(0, 0, 0);
      ref.current.appendChild(renderer.domElement);
      renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
    }
  }, [ref.current, renderer, camera]);

  React.useEffect(() => {
    let running = true;
    let video = videoRef.current;

    const listener = () => {
      estimator.setResolution(videoRef.current!);
    };

    video?.addEventListener('loadedmetadata', listener);

    const updatePose = async () => {
      if (!running) {
        return;
      }
      video = videoRef.current;
      stats.begin();
      if (
        net &&
        video &&
        video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA
      ) {
        const p = await net.estimateSinglePose(video, {
          flipHorizontal: true,
        });
        if (!running) {
          return;
        }
        estimator.update(p);
        cube.position.copy(estimator.position);
        cube.rotation.setFromRotationMatrix(estimator.orientation);
        setPose(p);
      }

      renderer.render(scene, camera);

      stats.end();
      requestAnimationFrame(updatePose);
    };

    updatePose();

    return () => {
      running = false;
      video?.removeEventListener('loadedmetadata', listener);
    };
  }, [net, videoRef, estimator]);

  if (!pose) {
    return null;
  }

  const confidentPoints = pose.keypoints.filter((k) => k.score >= 0.5);

  return (
    <div className={classes.PoseEstimator}>
      {pose.score}
      <div className={classes.PoseEstimator_canvas} ref={ref} />
      <table>
        <thead></thead>
        <tbody>
          {confidentPoints.map((k) => {
            return (
              <tr key={k.part}>
                <td>{k.part}</td>
                <td>{k.score.toPrecision(2)}</td>
                <td>
                  {Math.floor(k.position.x)}, {Math.floor(k.position.y)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const useStyles = createUseStyles({
  PoseEstimator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  PoseEstimator_canvas: {
    width: 400,
    height: 400,
  },
});

export default PoseEstimator;

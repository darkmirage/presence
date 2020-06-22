import React from 'react';
import { PoseNet, Pose, Keypoint } from '@tensorflow-models/posenet';
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

export function drawPoint(
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  r: number
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = 'aqua';
  ctx.fill();
}

function drawKeypoints(
  keypoints: Keypoint[],
  minConfidence: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const { y, x } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 10);
  }
}

const PoseEstimator = (props: Props) => {
  const { videoRef } = props;
  const classes = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
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
  const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);

  React.useEffect(() => {
    document.body.appendChild(stats.dom);

    getPoseNet().then((n) => {
      setNet(n);
    });
  }, []);

  React.useEffect(() => {
    if (ref.current && ref.current.children.length === 0) {
      camera.position.set(-2, 1, 2);
      camera.lookAt(0, 0, 0);
      ref.current.appendChild(renderer.domElement);
      renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
    }

    if (videoRef.current && canvasRef.current) {
      canvasRef.current.width = videoRef.current.width;
      canvasRef.current.height = videoRef.current.height;
    }

    if (!ctx && canvasRef.current) {
      const c = canvasRef.current.getContext('2d');
      setCtx(c);
    }
  }, [pose, camera, ctx, renderer, videoRef]);

  React.useEffect(() => {
    const video = videoRef.current!;

    const listener = () => {
      estimator.setResolution(video);
    };

    video.addEventListener('loadedmetadata', listener);

    return () => {
      video.removeEventListener('loadedmetadata', listener);
    };
  }, [estimator, videoRef]);

  React.useEffect(() => {
    let running = true;
    if (!net) {
      return;
    }

    const updatePose = async () => {
      const video = videoRef.current;
      if (video && video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
        stats.begin();
        const p = await net.estimateSinglePose(video, {
          flipHorizontal: false,
        });
        if (!running) {
          return;
        }
        setPose(p);
        stats.end();
      }
      requestAnimationFrame(updatePose);
    };

    updatePose();

    return () => {
      running = false;
    };
  }, [net, videoRef]);

  React.useEffect(() => {
    if (!pose) {
      return;
    }

    estimator.update(pose);
    cube.position.copy(estimator.position);
    cube.rotation.setFromRotationMatrix(estimator.orientation);

    const canvas = canvasRef.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawKeypoints(pose.keypoints, 0.5, ctx);
    }

    renderer.render(scene, camera);
  }, [estimator, camera, cube, renderer, scene, ctx, pose]);

  if (!pose) {
    return null;
  }

  return (
    <>
      <div className={classes.PoseEstimator_canvasContainer}>
        <canvas
          ref={canvasRef}
          className={classes.PoseEstimator_canvas}
          width={1000}
          height={1000}
        />
      </div>
      <div className={classes.PoseEstimator_3d} ref={ref} />
      <table className={classes.PoseEstimator_table}>
        <thead></thead>
        <tbody>
          <tr>
            <td>Score</td>
            <td>{pose.score.toPrecision(4)}</td>
          </tr>
          <tr>
            <td>Position</td>
            <td>{estimator.position.x.toPrecision(4)}</td>
            <td>{estimator.position.y.toPrecision(4)}</td>
            <td>{estimator.position.z.toPrecision(4)}</td>
          </tr>
          {pose.keypoints.map((k) => {
            return (
              <tr
                key={k.part}
                className={
                  k.score > 0.5
                    ? classes.PoseEstimator_active
                    : classes.PoseEstimator_inactive
                }
              >
                <td>{k.part}</td>
                <td>{k.score.toPrecision(2)}</td>
                <td>{Math.floor(k.position.x)}</td>
                <td>{Math.floor(k.position.y)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

const useStyles = createUseStyles({
  PoseEstimator_canvasContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 400,
    height: 400,
  },
  PoseEstimator_canvas: {
    objectFit: 'cover',
    maxWidth: '100%',
    height: '100%',
  },
  PoseEstimator_3d: {
    width: 400,
    height: 400,
  },
  PoseEstimator_table: {
    padding: 8,
    fontSize: 10,
    maxHeight: 400,
    overflowY: 'scroll',
    '& td': {
      minWidth: 80,
    },
  },
  PoseEstimator_active: {},
  PoseEstimator_inactive: {
    opacity: 0.5,
  },
});

export default PoseEstimator;

import React from 'react';
import { createUseStyles } from 'react-jss';
import { Scene, WebGLRenderer, Vector3 } from 'three';
import { Slider } from '@blueprintjs/core';

import OffAxisCamera from '../three/OffAxisCamera';
import RTCClient from '../rtc/RTCClient';
import { createDefaultScene, loadAvatar } from '../three/assets';

type Props = {
  client: RTCClient;
};

const ORIGIN = new Vector3();
const V = new Vector3();

const MULTIPLIER = 1;
const MONITOR_WIDTH = 0.0868 * MULTIPLIER;
const MONITOR_HEIGHT = 0.0868 * MULTIPLIER;

const FacePoseOffAxis = (props: Props) => {
  const { client } = props;
  const classes = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);

  const [xCam, setXCam] = React.useState(0);
  const [yCam, setYCam] = React.useState(0);
  const [zCam, setZCam] = React.useState(0);
  const [showSlider] = React.useState(true);
  const [renderer] = React.useState<WebGLRenderer>(
    () => new WebGLRenderer({ antialias: true })
  );
  const [camera] = React.useState<OffAxisCamera>(() => {
    const c = new OffAxisCamera(
      new Vector3(-MONITOR_WIDTH / 2, -MONITOR_HEIGHT / 2, -0.55),
      new Vector3(MONITOR_WIDTH / 2, -MONITOR_HEIGHT / 2, -0.55),
      new Vector3(-MONITOR_WIDTH / 2, MONITOR_HEIGHT / 2, -0.55)
    );
    c.position.set(xCam, yCam, 0);
    return c;
  });
  const [scene] = React.useState<Scene>(createDefaultScene);
  const [face] = React.useState(() => loadAvatar(scene));

  const handleClick = () => {
    ORIGIN.copy(V);
  };

  React.useEffect(() => {
    if (ref.current && ref.current.children.length === 0) {
      // camera.aspect = ref.current.clientWidth / ref.current.clientHeight;
      camera.updateProjectionMatrix();
      ref.current.appendChild(renderer.domElement);
      renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
      renderer.render(scene, camera);
    }
  }, [camera, renderer, scene]);

  React.useEffect(() => {
    camera.position.set(xCam, yCam, zCam);
    renderer.render(scene, camera);
  }, [renderer, scene, camera, xCam, yCam, zCam]);

  React.useEffect(() => {
    client.onPose((pose) => {
      V.set(pose.x, pose.y, pose.z);
      face.scale.set(0.1, 0.1, 0.1);
      face.position.set(0, 0, -0.55);
      // face.rotation.set(pose.rx, -pose.ry, -pose.rz);
      // const cameraY = face.position.y + 0.25;
      // camera.position.setY(cameraY);
      // camera.lookAt(0, cameraY, 0);
      camera.position.set(
        pose.x - ORIGIN.x,
        pose.y - ORIGIN.y,
        -pose.z + ORIGIN.z
      );
      // camera.rotation.set(pose.rx, pose.ry, pose.rz);
      renderer.render(scene, camera);
    });
  }, [client, face, camera, renderer, scene]);

  const sliders = showSlider ? (
    <>
      <div>
        {xCam.toFixed(2)}
        <Slider
          value={xCam}
          stepSize={0.01}
          onChange={setXCam}
          vertical
          min={-2}
          max={2}
          labelRenderer={false}
        />
      </div>
      <div>
        {yCam.toFixed(2)}
        <Slider
          value={yCam}
          stepSize={0.01}
          onChange={setYCam}
          vertical
          min={-2}
          max={2}
          labelRenderer={false}
        />
      </div>
      <div>
        {yCam.toFixed(2)}
        <Slider
          value={zCam}
          stepSize={0.01}
          onChange={setZCam}
          vertical
          min={-2}
          max={2}
          labelRenderer={false}
        />
      </div>
    </>
  ) : null;

  return (
    <>
      <div
        className={classes.FacePoseOffAxis}
        ref={ref}
        onClick={handleClick}
      />
      {sliders}
    </>
  );
};

const useStyles = createUseStyles({
  FacePoseOffAxis: {
    width: 400 * MULTIPLIER,
    height: 400 * MULTIPLIER,
  },
});

export default FacePoseOffAxis;

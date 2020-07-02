import React from 'react';
import { createUseStyles } from 'react-jss';
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';

import RTCClient from '../rtc/RTCClient';
import { loadAvatar, createDefaultScene } from '../three/assets';

type Props = {
  client: RTCClient;
};

const FacePoseVisualizer = (props: Props) => {
  const { client } = props;
  const classes = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);

  const [renderer] = React.useState<WebGLRenderer>(
    () => new WebGLRenderer({ antialias: true })
  );
  const [camera] = React.useState<PerspectiveCamera>(() => {
    const c = new PerspectiveCamera();
    c.position.set(0, 0.3, 0.5);
    return c;
  });
  const [scene] = React.useState<Scene>(createDefaultScene);
  const [face] = React.useState(() => loadAvatar(scene));

  React.useEffect(() => {
    if (ref.current && ref.current.children.length === 0) {
      camera.aspect = ref.current.clientWidth / ref.current.clientHeight;
      camera.updateProjectionMatrix();
      ref.current.appendChild(renderer.domElement);
      renderer.setSize(ref.current.clientWidth, ref.current.clientHeight);
      renderer.render(scene, camera);
    }
  }, [camera, renderer, scene]);

  React.useEffect(() => {
    client.onPose((pose) => {
      face.position.set(-pose.x, pose.y, pose.z);
      face.rotation.set(pose.rx, -pose.ry, -pose.rz);
      const cameraY = face.position.y + 0.25;
      camera.position.setY(cameraY);
      renderer.render(scene, camera);
    });
  }, [client, face, camera, renderer, scene]);

  return <div className={classes.FacePoseVisualizer} ref={ref} />;
};

const useStyles = createUseStyles({
  FacePoseVisualizer: {
    width: 400,
    height: 400,
  },
});

export default FacePoseVisualizer;

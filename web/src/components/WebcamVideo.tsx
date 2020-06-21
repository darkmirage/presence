import React from 'react';
import { createUseStyles } from 'react-jss';

import Video from './Video';
import PoseEstimator from './PoseEstimator';

type Props = {};

const WebcamVideo = (props: Props) => {
  const classes = useStyles();
  const ref = React.useRef<HTMLVideoElement>(null!);

  React.useEffect(() => {
    let stream: MediaStream | null = null;

    window.navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'user',
          width: 1920,
          height: 1920,
        },
      })
      .then((s) => {
        stream = s;
        ref.current.srcObject = stream;
        const { height, width } = s.getVideoTracks()[0].getSettings();
        ref.current.height = height!;
        ref.current.width = width!;
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className={classes.WebcamVideo}>
      <Video ref={ref} />
      <PoseEstimator videoRef={ref} />
    </div>
  );
};

const useStyles = createUseStyles({
  WebcamVideo: {
    width: 400,
    height: 400,
  },
});

export default WebcamVideo;

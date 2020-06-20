import React from 'react';
import { createUseStyles } from 'react-jss';

import Video from './Video';

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
        },
      })
      .then((s) => {
        stream = s;
        ref.current.srcObject = stream;
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [ref.current]);

  return (
    <div className={classes.WebcamVideo}>
      <Video ref={ref} />
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

import React from 'react';
import { createUseStyles } from 'react-jss';
import { Spinner } from '@blueprintjs/core';
import classNames from 'classnames';

import Video from './Video';

type Props = {
  children?: (
    ref: React.RefObject<HTMLVideoElement>,
    flipped: boolean
  ) => React.ReactNode;
  hidden?: boolean;
  facingMode?: 'user' | 'environment';
};

const WebcamVideo = ({
  children,
  hidden = false,
  facingMode = 'user',
}: Props) => {
  const classes = useStyles();
  const ref = React.useRef<HTMLVideoElement>(null!);
  const flipped = facingMode === 'user';
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let stream: MediaStream | null = null;

    window.navigator.mediaDevices
      .getUserMedia({
        video: { facingMode, width: 1920 },
      })
      .then((s) => {
        stream = s;
        ref.current.srcObject = stream;
        const { height, width } = s.getVideoTracks()[0].getSettings();
        ref.current.height = height!;
        ref.current.width = width!;
        console.log('Webcam dimensions', width, height);
        setLoading(false);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  return (
    <div className={classes.WebcamVideo}>
      {loading ? (
        <Spinner
          size={Spinner.SIZE_STANDARD}
          className={classes.WebcamVideo_loader}
        />
      ) : null}
      <div
        className={classNames(
          { [classes.WebcamVideo_hidden]: hidden },
          classes.WebcamVideo_video
        )}
      >
        <Video
          ref={ref}
          className={classNames({ [classes.WebcamVideo_flipped]: flipped })}
        />
      </div>
      {children ? children(ref, flipped) : null}
    </div>
  );
};

const useStyles = createUseStyles({
  WebcamVideo: {
    display: 'flex',
    position: 'relative',
  },
  WebcamVideo_loader: {
    marginTop: 12,
  },
  WebcamVideo_hidden: {
    visibility: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  WebcamVideo_video: {
    width: 400,
    height: 400,
  },
  WebcamVideo_flipped: {
    transform: 'scaleX(-1)',
  },
});

export default WebcamVideo;

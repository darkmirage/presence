import React from 'react';
import { createUseStyles } from 'react-jss';

import { VideoTrack } from 'twilio-video';

type Props = {
  track: VideoTrack;
  local: boolean;
};

const Video = ({ track, local }: Props) => {
  const classes = useStyles();
  const ref = React.useRef<HTMLVideoElement>(null!);

  React.useEffect(() => {
    const el = ref.current;
    el.muted = true;
    track.attach(el);

    return () => {
      track.detach(el);
    };
  }, [track]);

  return <video className={classes.Video} ref={ref} />;
};

const useStyles = createUseStyles({
  Video: {
    objectFit: 'cover',
    maxWidth: '100%',
    height: '100%',
  },
});

export default Video;

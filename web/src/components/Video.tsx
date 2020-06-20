import React from 'react';
import { createUseStyles } from 'react-jss';

const Video = React.forwardRef<HTMLVideoElement>((props, ref) => {
  const classes = useStyles();
  return <video className={classes.Video} ref={ref} muted autoPlay />;
});

const useStyles = createUseStyles({
  Video: {
    objectFit: 'cover',
    maxWidth: '100%',
    height: '100%',
  },
});

export default Video;

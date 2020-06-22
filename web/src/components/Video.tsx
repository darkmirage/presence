import React from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

type Props = React.ComponentPropsWithoutRef<'video'>;

const Video = React.forwardRef<HTMLVideoElement, Props>(
  ({ className, ...rest }, ref) => {
    const classes = useStyles();
    return (
      <video
        className={classNames(classes.Video, className)}
        ref={ref}
        muted
        autoPlay
        {...rest}
      />
    );
  }
);

const useStyles = createUseStyles({
  Video: {
    objectFit: 'cover',
    maxWidth: '100%',
    height: '100%',
  },
});

export default Video;

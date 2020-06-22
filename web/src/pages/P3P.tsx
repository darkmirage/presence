import React from 'react';
import { createUseStyles } from 'react-jss';
import { Button } from '@blueprintjs/core';

import WebcamVideo from '../components/WebcamVideo';

const P3P = () => {
  const classes = useStyles();

  const [showPoseNet, setShowPoseNet] = React.useState(false);

  return (
    <div className={classes.P3P}>
      <Button onClick={() => setShowPoseNet(!showPoseNet)}>
        {showPoseNet ? 'Stop PoseNet' : 'Start PoseNet'}
      </Button>
      {showPoseNet ? <WebcamVideo /> : null}
    </div>
  );
};

const useStyles = createUseStyles({
  P3P: {},
});

export default P3P;

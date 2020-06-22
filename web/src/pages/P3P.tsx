import React from 'react';
import { createUseStyles } from 'react-jss';
import { Button } from '@blueprintjs/core';

import WebcamVideo from '../components/WebcamVideo';
import PoseNetContainer from '../components/PoseNetContainer';
import PoseOverlay from '../components/PoseOverlay';
import PoseResults from '../components/PoseResults';
import PoseVisualizer from '../components/PoseVisualizer';

const P3P = () => {
  const classes = useStyles();

  const [showPoseNet, setShowPoseNet] = React.useState(false);

  return (
    <div className={classes.P3P}>
      <Button onClick={() => setShowPoseNet(!showPoseNet)}>
        {showPoseNet ? 'Stop PoseNet' : 'Start PoseNet'}
      </Button>
      {showPoseNet ? (
        <WebcamVideo>
          {(ref, flipped) => (
            <PoseNetContainer videoRef={ref} flipped={flipped}>
              {(pose, estimator) => (
                <>
                  <PoseOverlay videoRef={ref} pose={pose} />
                  <PoseVisualizer pose={pose} estimator={estimator} />
                  <PoseResults pose={pose} />
                </>
              )}
            </PoseNetContainer>
          )}
        </WebcamVideo>
      ) : null}
    </div>
  );
};

const useStyles = createUseStyles({
  P3P: {},
});

export default P3P;

import React from 'react';
import { createUseStyles } from 'react-jss';
import { Button, ButtonGroup } from '@blueprintjs/core';

import WebcamVideo from '../components/WebcamVideo';
import PoseNetContainer from '../components/PoseNetContainer';
import ParallaxScene from '../components/ParallaxScene';
import PoseOverlay from '../components/PoseOverlay';

const ParallaxDemo = () => {
  const classes = useStyles();

  const [startPoseNet, setStartPoseNet] = React.useState(false);

  return (
    <div className={classes.ParallaxDemo}>
      <ButtonGroup>
        <Button onClick={() => setStartPoseNet(!startPoseNet)}>
          {startPoseNet ? 'Stop PoseNet' : 'Start PoseNet'}
        </Button>
      </ButtonGroup>
      {startPoseNet ? (
        <WebcamVideo>
          {(ref, flipped) => (
            <PoseNetContainer
              videoRef={ref}
              flipped={flipped}
              useP3P={false}
              useKalmanFilter={false}
            >
              {(pose, estimator) => (
                <>
                  <PoseOverlay videoRef={ref} pose={pose} />
                  <ParallaxScene pose={pose} estimator={estimator} />
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
  ParallaxDemo: {},
});

export default ParallaxDemo;

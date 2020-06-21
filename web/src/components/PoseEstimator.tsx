import React from 'react';
import * as posenet from '@tensorflow-models/posenet';
import { createUseStyles } from 'react-jss';
import Stats from 'stats.js';

import { getPoseNet } from '../posenet';

const stats = new Stats();
stats.showPanel(0);

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
};

const PoseEstimator = (props: Props) => {
  const { videoRef } = props;
  const classes = useStyles();
  const [net, setNet] = React.useState<posenet.PoseNet | null>(null);
  const [pose, setPose] = React.useState<posenet.Pose | null>(null);

  React.useEffect(() => {
    document.body.appendChild(stats.dom);

    getPoseNet().then((n) => {
      setNet(n);
    });
  }, []);

  React.useEffect(() => {
    let running = true;

    const updatePose = async () => {
      if (!running) {
        return;
      }
      const video = videoRef.current;
      stats.begin();
      if (
        net &&
        video &&
        video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA
      ) {
        const p = await net.estimatePoses(video, {
          decodingMethod: 'single-person',
          flipHorizontal: true,
        });
        if (!running) {
          return;
        }
        setPose(p[0]);
      }

      stats.end();
      requestAnimationFrame(updatePose);
    };

    updatePose();

    return () => {
      running = false;
    };
  }, [net, videoRef]);

  if (!pose) {
    return null;
  }

  const confidentPoints = pose.keypoints.filter((k) => k.score >= 0.5);

  return (
    <div className={classes.PoseEstimator}>
      {pose.score}
      <table>
        <thead></thead>
        <tbody>
          {confidentPoints.map((k) => {
            return (
              <tr key={k.part}>
                <td>{k.part}</td>
                <td>{k.score.toPrecision(2)}</td>
                <td>
                  {Math.floor(k.position.x)}, {Math.floor(k.position.y)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const useStyles = createUseStyles({
  PoseEstimator: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
});

export default PoseEstimator;

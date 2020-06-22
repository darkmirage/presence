import React from 'react';
import { PoseNet, Pose, partNames } from '@tensorflow-models/posenet';
import Stats from 'stats.js';

import getPoseNet from '../cv/getPoseNet';
import Estimator from '../cv/PoseEstimator';
import KalmanFilter from '../cv/KalmanFilter';

const stats = new Stats();
stats.showPanel(0);

type Props = {
  videoRef: React.RefObject<HTMLVideoElement>;
  flipped?: boolean;
  useKalmanFilter?: boolean;
  useP3P?: boolean;
  children?: (
    pose: Pose,
    estimator: Estimator,
    net: PoseNet
  ) => React.ReactNode;
};

const filterPose = (() => {
  const filterOptions = {
    R: 1,
    Q: 2.5,
  };
  const xFilters: Record<string, KalmanFilter> = {};
  const yFilters: Record<string, KalmanFilter> = {};
  partNames.forEach((name) => {
    xFilters[name] = new KalmanFilter(filterOptions);
    yFilters[name] = new KalmanFilter(filterOptions);
  });

  return (pose: Pose, minConfidence: number): Pose => {
    for (const k of pose.keypoints) {
      if (k.score >= minConfidence) {
        k.position.x = xFilters[k.part].filter(k.position.x);
        k.position.y = yFilters[k.part].filter(k.position.y);
      }
    }

    return pose;
  };
})();

const PoseNetContainer = (props: Props) => {
  const {
    videoRef,
    children,
    flipped = false,
    useKalmanFilter = true,
    useP3P = true,
  } = props;
  const [net, setNet] = React.useState<PoseNet | null>(null);
  const [pose, setPose] = React.useState<Pose | null>(null);
  const [estimator] = React.useState(() => new Estimator(useP3P));

  React.useEffect(() => {
    document.body.appendChild(stats.dom);

    getPoseNet().then((n) => {
      setNet(n);
    });
  }, []);

  React.useEffect(() => {
    const video = videoRef.current!;

    const listener = () => {
      estimator.setResolution(video);
    };

    video.addEventListener('loadedmetadata', listener);
    return () => {
      video.removeEventListener('loadedmetadata', listener);
    };
  }, [estimator, videoRef]);

  React.useEffect(() => {
    let running = true;
    if (!net) {
      return;
    }

    const updatePose = async () => {
      const video = videoRef.current;
      if (video && video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) {
        stats.begin();
        let p = await net.estimateSinglePose(video, {
          flipHorizontal: flipped,
        });
        if (useKalmanFilter) {
          p = filterPose(p, 0.5);
        }
        if (!running) {
          return;
        }
        setPose(p);
        stats.end();
      }
      requestAnimationFrame(updatePose);
    };

    updatePose();

    return () => {
      running = false;
    };
  }, [net, videoRef, flipped, useKalmanFilter]);

  React.useEffect(() => {
    if (!pose) {
      return;
    }

    estimator.update(pose);
  }, [estimator, pose]);

  if (!pose || !net) {
    return null;
  }

  return <>{pose && children ? children(pose, estimator, net) : null}</>;
};

export default PoseNetContainer;

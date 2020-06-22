import React from 'react';
import { Pose, Keypoint } from '@tensorflow-models/posenet';
import { createUseStyles } from 'react-jss';

type Props = {
  pose: Pose;
  videoRef: React.RefObject<HTMLVideoElement>;
};

export function drawPoint(
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  r: number
) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = 'aqua';
  ctx.fill();
}

function drawKeypoints(
  keypoints: Keypoint[],
  minConfidence: number,
  ctx: CanvasRenderingContext2D,
  scale: number = 1
) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (keypoint.score < minConfidence) {
      continue;
    }

    const { y, x } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 10);
  }
}

const PoseOverlay = (props: Props) => {
  const classes = useStyles();
  const ref = React.useRef<HTMLCanvasElement>(null);
  const { videoRef, pose } = props;

  const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null);

  React.useEffect(() => {
    if (!ctx && ref.current) {
      const c = ref.current.getContext('2d');
      setCtx(c);
    }
  }, [pose, ctx]);

  React.useEffect(() => {
    if (videoRef.current && ref.current) {
      ref.current.width = videoRef.current.width;
      ref.current.height = videoRef.current.height;
    }

    const canvas = ref.current;
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawKeypoints(pose.keypoints, 0.5, ctx);
    }
  }, [ctx, pose, videoRef]);

  return (
    <div className={classes.PoseOverlay}>
      <canvas ref={ref} className={classes.PoseOverlay_canvas} />
    </div>
  );
};

const useStyles = createUseStyles({
  PoseOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 400,
    height: 400,
  },
  PoseOverlay_canvas: {
    objectFit: 'cover',
    maxWidth: '100%',
    height: '100%',
  },
});

export default PoseOverlay;

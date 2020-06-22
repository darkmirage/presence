import React from 'react';
import { Pose } from '@tensorflow-models/posenet';
import { createUseStyles } from 'react-jss';

type Props = {
  pose: Pose;
};

const PoseResults = (props: Props) => {
  const { pose } = props;
  const classes = useStyles();

  return (
    <table className={classes.PoseResults}>
      <thead></thead>
      <tbody>
        <tr>
          <td>Score</td>
          <td>{pose.score.toPrecision(4)}</td>
        </tr>
        {pose.keypoints.map((k) => {
          return (
            <tr
              key={k.part}
              className={
                k.score > 0.5
                  ? classes.PoseResults_active
                  : classes.PoseResults_inactive
              }
            >
              <td>{k.part}</td>
              <td>{k.score.toPrecision(2)}</td>
              <td>{Math.floor(k.position.x)}</td>
              <td>{Math.floor(k.position.y)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const useStyles = createUseStyles({
  PoseResults: {
    padding: 8,
    fontSize: 10,
    maxHeight: 400,
    overflowY: 'scroll',
    '& td': {
      minWidth: 80,
    },
  },
  PoseResults_active: {},
  PoseResults_inactive: {
    opacity: 0.5,
  },
});

export default PoseResults;

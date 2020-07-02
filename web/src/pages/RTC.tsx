import React from 'react';
import { createUseStyles } from 'react-jss';
import { Button, InputGroup } from '@blueprintjs/core';

import FacePoseVisualizer from '../components/FacePoseVisualizer';
import FacePoseOffAxis from '../components/FacePoseOffAxis';
import RTCClient, { FacePose } from '../rtc/RTCClient';

const PLACEHOLDER_POSE: FacePose = {
  x: 0,
  y: 0,
  z: 0,
  rx: 0,
  ry: 0,
  rz: 0,
};

const RTC = () => {
  const classes = useStyles();
  const [started, setStarted] = React.useState(false);
  const [channelId, setChannelId] = React.useState(
    localStorage.getItem('presence.channelId') || ''
  );
  const [loading, setLoading] = React.useState(true);
  const [client, setClient] = React.useState<RTCClient | null>(null);
  const [pose, setPose] = React.useState<FacePose>(PLACEHOLDER_POSE);

  React.useEffect(() => {
    const c = new RTCClient(setPose, () => setStarted(false));
    setClient(c);
    setLoading(false);
  }, []);

  const handleChange = (event: React.ChangeEvent<any>) => {
    const { value } = event.target;
    setChannelId(value);
  };

  const handleStart = async () => {
    localStorage.setItem('presence.channelId', channelId);
    setLoading(true);
    await client!.connect(channelId);
    setLoading(false);
    setStarted(true);
  };

  const content = started ? (
    <>
      <table className={classes.RTC}>
        <tbody>
          <tr>
            <td> x: {pose.x}</td>
            <td> y: {pose.y}</td>
            <td> z: {pose.z}</td>
          </tr>
          <tr>
            <td>rx: {pose.rx}</td>
            <td>ry: {pose.ry}</td>
            <td>rz: {pose.rz}</td>
          </tr>
        </tbody>
      </table>
      <div className={classes.RTC_container}>
        <FacePoseVisualizer client={client!} />
        <FacePoseOffAxis client={client!} />
      </div>
    </>
  ) : (
    <div className={classes.RTC}>
      <InputGroup
        placeholder="Channel ID"
        type="text"
        value={channelId}
        onChange={handleChange}
      />
      <Button loading={loading} onClick={handleStart}>
        Start
      </Button>
    </div>
  );

  return <div className={classes.RTC}>{content}</div>;
};

const useStyles = createUseStyles({
  RTC: {
    '& td': {
      width: 100,
      fontFamily: 'monospace',
    },
  },
  RTC_container: {
    display: 'flex',
  },
});

export default RTC;

import React from 'react';
import { createUseStyles } from 'react-jss';
import { Button, InputGroup } from '@blueprintjs/core';

import RTCClient from '../rtc/RTCClient';

const RTC = () => {
  const classes = useStyles();
  const [started, setStarted] = React.useState(false);
  const [channelId, setChannelId] = React.useState(
    localStorage.getItem('presence.channelId') || ''
  );
  const [loading, setLoading] = React.useState(false);
  const [client] = React.useState(() => new RTCClient());

  const handleChange = (event: React.ChangeEvent<any>) => {
    const { value } = event.target;
    setChannelId(value);
  };

  const handleStart = async () => {
    localStorage.setItem('presence.channelId', channelId);
    setLoading(true);
    await client.connect(channelId);
    setLoading(false);
    setStarted(true);
  };

  const content = started ? (
    <div>Connected</div>
  ) : (
    <>
      <InputGroup
        placeholder="Channel ID"
        type="text"
        value={channelId}
        onChange={handleChange}
      />
      <Button loading={loading} onClick={handleStart}>
        Start
      </Button>
    </>
  );

  return <div className={classes.RTC}>{content}</div>;
};

const useStyles = createUseStyles({
  RTC: {},
});

export default RTC;

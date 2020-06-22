import React from 'react';
import { createUseStyles } from 'react-jss';
import { Button, InputGroup } from '@blueprintjs/core';

import VideoChat from '../components/VideoChat';

const Twilio = () => {
  const classes = useStyles();
  const [started, setStarted] = React.useState(false);
  const [username, setUsername] = React.useState(
    localStorage.getItem('presence.username') || ''
  );

  const handleChange = (event: React.ChangeEvent<any>) => {
    const { value } = event.target;
    setUsername(value);
  };

  const handleStart = () => {
    localStorage.setItem('presence.username', username);
    setStarted(true);
  };

  const content = started ? (
    <VideoChat username={username} roomName="main" />
  ) : (
    <>
      <InputGroup
        placeholder="User name"
        type="text"
        value={username}
        onChange={handleChange}
      />
      <Button onClick={handleStart}>Start</Button>
    </>
  );

  return <div className={classes.Twilio}>{content}</div>;
};

const useStyles = createUseStyles({
  Twilio: {},
});

export default Twilio;

import React from 'react';
import { Classes, Button, InputGroup, Tab, Tabs } from '@blueprintjs/core';
import { createUseStyles } from 'react-jss';

import VideoChat from './components/VideoChat';
import WebcamVideo from './components/WebcamVideo';

const App = () => {
  document.body.className = Classes.DARK;
  const classes = useStyles();
  const [username, setUsername] = React.useState(
    localStorage.getItem('presence.username') || ''
  );
  const [started, setStarted] = React.useState(false);
  const [showPoseNet, setShowPoseNet] = React.useState(false);

  const handleChange = (event: React.ChangeEvent<any>) => {
    const { value } = event.target;
    setUsername(value);
  };

  const handleStart = () => {
    localStorage.setItem('presence.username', username);
    setStarted(true);
  };

  const twilioPanel = started ? (
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

  const poseNetPanel = (
    <>
      <Button onClick={() => setShowPoseNet(!showPoseNet)}>
        {showPoseNet ? 'Stop PoseNet' : 'Start PoseNet'}
      </Button>
      {showPoseNet ? <WebcamVideo /> : null}
    </>
  );

  return (
    <div className={classes.App}>
      <Tabs defaultSelectedTabId="posenet">
        <Tab id="twilio" title="Twilio" panel={twilioPanel} />
        <Tab id="posenet" title="PoseNet" panel={poseNetPanel} />
      </Tabs>
    </div>
  );
};

const useStyles = createUseStyles({
  App: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
  },
});

export default App;

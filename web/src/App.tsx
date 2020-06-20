import React from 'react';
import { Classes, Button, InputGroup } from '@blueprintjs/core';
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
  const [showPreview, setShowPreview] = React.useState(true);

  const handleChange = (event: React.ChangeEvent<any>) => {
    const { value } = event.target;
    setUsername(value);
  };

  const handleStart = () => {
    localStorage.setItem('presence.username', username);
    setStarted(true);
  };

  return (
    <div className={classes.App}>
      {started ? (
        <VideoChat username={username} roomName="main" />
      ) : (
        <>
          {showPreview ? <WebcamVideo /> : null}
          <InputGroup
            placeholder="User name"
            type="text"
            value={username}
            onChange={handleChange}
          />
          <Button onClick={handleStart}>Start</Button>
          <Button onClick={() => setShowPreview(!showPreview)}>Preview</Button>
        </>
      )}
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

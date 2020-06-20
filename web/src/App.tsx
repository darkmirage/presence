import React from 'react';
import { Classes } from '@blueprintjs/core';
import { createUseStyles } from 'react-jss';

import { randomId } from './random';
import VideoChat from './components/VideoChat';

const App = () => {
  document.body.className = Classes.DARK;
  const classes = useStyles();
  return <div className={classes.App}><VideoChat username={randomId()} roomName="main" /></div>;
}

const useStyles = createUseStyles({
  App: {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
  }
})

export default App;

import React from 'react';
import { Classes, Tab, Tabs } from '@blueprintjs/core';
import { createUseStyles } from 'react-jss';

import Twilio from './pages/Twilio';
import P3P from './pages/P3P';

const App = () => {
  document.body.className = Classes.DARK;
  const classes = useStyles();

  return (
    <div className={classes.App}>
      <Tabs defaultSelectedTabId="p3p">
        <Tab id="twilio" title="Twilio" panel={<Twilio />} />
        <Tab id="p3p" title="P3P" panel={<P3P />} />
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

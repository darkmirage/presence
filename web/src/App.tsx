import React from 'react';
import { Classes, Tab, Tabs } from '@blueprintjs/core';
import { createUseStyles } from 'react-jss';

import Twilio from './pages/Twilio';
import P3P from './pages/P3P';
import ParallaxDemo from './pages/ParallaxDemo';

const App = () => {
  document.body.className = Classes.DARK;
  const classes = useStyles();

  return (
    <div className={classes.App}>
      <div className={classes.App_content}>
        <Tabs defaultSelectedTabId="parallax" renderActiveTabPanelOnly>
          <Tab id="twilio" title="Twilio" panel={<Twilio />} disabled />
          <Tab id="p3p" title="P3P" panel={<P3P />} />
          <Tab id="parallax" title="Parallax" panel={<ParallaxDemo />} />
        </Tabs>
      </div>
    </div>
  );
};

const useStyles = createUseStyles({
  App: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  App_content: {
    minHeight: 500,
  },
});

export default App;

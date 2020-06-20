import React from 'react';

import { randomId } from './random';
import VideoChat from './components/VideoChat';
import './App.css';

function App() {
  return <div className="App"><VideoChat username={randomId()} roomName="main" /></div>;
}

export default App;

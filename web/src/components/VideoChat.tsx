import React from 'react';

import { getPoseNet } from '../posenet';
import { connectRoom } from '../twilio';

type Props = {
  roomName: string,
  username: string,
}

function VideoChat(props: Props) {
  const [loading, setLoading] = React.useState<boolean>(true);

  

  return null;
}

export default VideoChat;
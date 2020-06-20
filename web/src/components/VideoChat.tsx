import React from 'react';
import { Spinner } from '@blueprintjs/core';
import { createUseStyles } from 'react-jss';

import { getPoseNet } from '../posenet';
import { connectRoom, Room, RemoteParticipant } from '../twilio';

type Props = {
  roomName: string,
  username: string,
}

const VideoChat = (props: Props) => {
  const classes = useStyles();
  const [room, setRoom] = React.useState<Room>();
  const [participants, setParticipants] = React.useState<RemoteParticipant[]>([]);

  React.useEffect(() => {
    connectRoom(props.username, props.roomName).then((r) => {
      const p = Array.from(r.participants.values());
      setRoom(r);
    });

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [props.roomName, props.username]);

  const content = room ? null : <Spinner />;

  return (
    <div className={classes.VideoChat}>
      {content}
    </div>
  );
}

const useStyles = createUseStyles({
  VideoChat: {

  }
})

export default VideoChat;
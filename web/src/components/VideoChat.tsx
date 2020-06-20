import React from 'react';
import { Spinner } from '@blueprintjs/core';
import { createUseStyles } from 'react-jss';
import { Room as TwilioRoom } from 'twilio-video';

import { connectRoom } from '../twilio';
import Room from './Room';

type Props = {
  roomName: string;
  username: string;
};

const VideoChat = (props: Props) => {
  const classes = useStyles();
  const [room, setRoom] = React.useState<TwilioRoom>();

  React.useEffect(() => {
    connectRoom(props.username, props.roomName).then((r) => {
      setRoom(r);
    });
  }, [props.roomName, props.username]);

  React.useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  const content = room ? <Room room={room} /> : <Spinner />;

  return <div className={classes.VideoChat}>{content}</div>;
};

const useStyles = createUseStyles({
  VideoChat: {},
});

export default VideoChat;

import React from 'react';
import { Room as TwilioRoom } from 'twilio-video';
import { createUseStyles } from 'react-jss';

import Participant from './Participant';
import useParticipants from '../hooks/useParticipants';

type Props = {
  room: TwilioRoom;
};

const Room = (props: Props) => {
  const { room } = props;
  const classes = useStyles();

  const participants = useParticipants(room);
  const participantElements = participants.map((p) => (
    <Participant key={p.sid} participant={p} />
  ));

  return (
    <div className={classes.Room}>
      <Participant participant={room.localParticipant} local />
      {participantElements}
    </div>
  );
};

const useStyles = createUseStyles({
  Room: {
    display: 'flex',
    maxWidth: 800,
  },
});

export default Room;

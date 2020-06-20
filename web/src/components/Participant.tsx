import React from 'react';
import { Participant as TwilioParticipant } from 'twilio-video';
import { createUseStyles } from 'react-jss';

import usePublications from '../hooks/usePublications';
import Publication from './Publication';

type Props = {
  participant: TwilioParticipant;
  local?: boolean;
};

const Participant = ({ participant, local = false }: Props) => {
  const classes = useStyles();
  const publications = usePublications(participant);
  console.log(publications);
  const publicationElements = publications.map((p) => (
    <Publication key={p.kind} publication={p} local={local} />
  ));

  return <div className={classes.Participant}>{publicationElements}</div>;
};

const useStyles = createUseStyles({
  Participant: {
    width: 200,
    height: 200,
  },
});

export default Participant;

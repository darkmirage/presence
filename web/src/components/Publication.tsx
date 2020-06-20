import React from 'react';

import useTrack from '../hooks/useTrack';
import Video from './Video';

import { LocalTrackPublication, RemoteTrackPublication } from 'twilio-video';

type Props = {
  publication: LocalTrackPublication | RemoteTrackPublication;
  local: boolean;
};

const Publication = ({ publication, local }: Props) => {
  const track = useTrack(publication);

  if (!track) {
    return null;
  }

  switch (track.kind) {
    case 'video':
      return <Video track={track} local={local} />;
    default:
      return null;
  }
};

export default Publication;

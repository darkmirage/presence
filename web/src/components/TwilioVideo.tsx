import React from 'react';
import { VideoTrack } from 'twilio-video';

import Video from './Video';

type Props = {
  track: VideoTrack;
  local: boolean;
};

const Twilio = ({ track, local }: Props) => {
  const ref = React.useRef<HTMLVideoElement>(null!);

  React.useEffect(() => {
    const el = ref.current;
    el.muted = true;
    track.attach(el);

    return () => {
      track.detach(el);
    };
  }, [track]);

  return <Video ref={ref} />;
};

export default Twilio;

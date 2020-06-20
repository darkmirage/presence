import { connect, Room, RemoteParticipant } from 'twilio-video';
import axios from 'axios';

const TOKEN_URL =
  'https://us-central1-presence-video.cloudfunctions.net/getTwilioToken';

async function connectRoom(username: string, roomName: string) {
  const res = await axios.get(TOKEN_URL, {
    params: { username, room: roomName },
  });
  const { token } = res.data;
  console.log(token);

  const room = await connect(token);
  return room;
}

export { connectRoom, Room, RemoteParticipant };

import * as functions from 'firebase-functions';
import { jwt } from 'twilio';

const { AccessToken } = jwt;
const ACCOUNT_SID = functions.config().twilio.asid;
const API_KEY_SID = functions.config().twilio.sid;
const API_KEY_SECRET = functions.config().twilio.secret;

export const getTwilioToken = functions.https.onRequest((request, response) => {
  const { username, room } = request.query;

  if (typeof username !== 'string' || typeof room !== 'string') {
    response.status(500).send({ error: 'Invalid username or room' });
    return;
  }

  const accessToken = new AccessToken(
    ACCOUNT_SID,
    API_KEY_SID,
    API_KEY_SECRET,
    { identity: username }
  );

  const grant = new AccessToken.VideoGrant({ room });
  accessToken.addGrant(grant);
  const token = accessToken.toJwt();

  console.log(username, room, token);
  response.send({ token });
});

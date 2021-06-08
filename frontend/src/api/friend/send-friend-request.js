import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function sendFriendRequest(to) {
  return (await fetch(
    apiURL() + "/users/friendrequest", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      },
      body: JSON.stringify({ to }),
    }
  )).json();
}

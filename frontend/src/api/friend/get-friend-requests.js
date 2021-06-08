import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getFriendRequest() {
  return (await fetch(
    apiURL() + "/users/friendrequest/", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

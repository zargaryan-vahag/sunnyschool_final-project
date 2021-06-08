import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getFriends({ userId, page }) {
  return (await fetch(
    apiURL() + "/users/friends/" + userId + "?page=" + page, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

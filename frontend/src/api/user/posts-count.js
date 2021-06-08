import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function postsCount(userId) {
  return (await fetch(
    apiURL() + "/posts/user/" + userId + "?action=postsCount", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      }
    }
  )).json();
}

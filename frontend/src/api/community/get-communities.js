import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getCommunities({ userId, page }) {
  return (await fetch(
    apiURL() + '/communities/userfollowing/' + userId + '?page=' + page, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accessToken: getToken(),
      }
    }
  )).json();
}

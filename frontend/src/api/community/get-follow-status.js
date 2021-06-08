import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getFollowStatus(communityId) {
  return (await fetch(
    apiURL() + '/communities/isfollower/' + communityId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accessToken: getToken(),
      }
    }
  )).json();
}

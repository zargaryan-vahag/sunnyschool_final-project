import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function toggleFollowCommunity(communityId) {
  return (await fetch(apiURL() + '/communities/togglefollow/' + communityId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accessToken: getToken(),
    }
  })).json();
}

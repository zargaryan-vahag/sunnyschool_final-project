import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getCommunity(communityId) {
  return (await fetch(
    apiURL() + '/communities/' + communityId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accessToken: getToken(),
      }
    }
  )).json();
}

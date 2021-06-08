import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function delCommunityAvatar(communityId) {
  return (await fetch(apiURL() + "/communities/avatar", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: getToken(),
      },
      body: JSON.stringify({communityId}),
    }
  )).json();
}

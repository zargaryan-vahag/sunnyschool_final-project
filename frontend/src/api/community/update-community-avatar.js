import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function updateCommunityAvatar({ avatar, communityId }) {
  const formData = new FormData();
  formData.append('file', avatar);
  formData.append('communityId', communityId);
  
  return (await fetch(
    apiURL() + "/communities/avatar", {
      method: 'PATCH',
      headers: {
        accesstoken: getToken(),
      },
      body: formData,
    }
  )).json();
}

import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function updateUserAvatar(avatar) {
  const formData = new FormData();
  formData.append('file', avatar);
  
  return (await fetch(
    apiURL() + "/users/avatar", {
      method: 'PATCH',
      headers: {
        accesstoken: getToken(),
      },
      body: formData,
    }
  )).json();
}

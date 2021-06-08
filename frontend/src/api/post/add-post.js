import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function addPost({ files, postText, communityId }) {
  const formData = new FormData();
  if (communityId) {
    formData.append('communityId', communityId);
  }
  formData.append('postText', postText);
  for (let file of files) {
    formData.append('files', file);
  }
  
  return (await fetch(
    apiURL() + '/posts', {
      method: 'POST',
      headers: {
        accesstoken: getToken(),
      },
      body: formData,
    }
  )).json();
}

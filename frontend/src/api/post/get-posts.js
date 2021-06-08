import { getToken } from '../../managers/token-manager';
import { apiURL } from '../config';

export default async function getPosts({ news, liked, userId, communityId, page }) {
  let url = apiURL();
  if (news) {
    url += '/posts?page=' + page;
  } else if (liked) {
    url += '/posts/liked?page=' + page;
  } else if (userId) {
    url += '/posts/user/' + userId + '?action=posts&page=' + page;
  } else if (communityId) {
    url += '/communities/posts/' + communityId + '?page=' + page;
  }

  return (await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      accessToken: getToken(),
    }
  })).json();
}

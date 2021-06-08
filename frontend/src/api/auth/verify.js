import { apiURL } from '../config';

export default async function verify(verifyToken) {
  return (await fetch(
    apiURL() + '/auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verifyToken }),
    }
  )).json();
}

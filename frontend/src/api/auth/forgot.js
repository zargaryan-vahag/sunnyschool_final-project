import { apiURL } from '../config';

export default async function forgot(email) {
  return (await fetch(
    apiURL() + '/auth/forgot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    }
  )).json();
}

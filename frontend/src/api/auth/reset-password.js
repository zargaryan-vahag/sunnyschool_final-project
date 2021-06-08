import { apiURL } from '../config';

export default async function resetPassword({ password, resetToken }) {
  return (await fetch(
    apiURL() + '/auth/passreset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, resetToken }),
    }
  )).json();
}

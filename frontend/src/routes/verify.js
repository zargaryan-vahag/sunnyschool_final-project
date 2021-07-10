import React, { useState, useEffect } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiAlert from '@material-ui/lab/Alert';
import Link from '../components/link';

import { verify as verifyAccount } from '../api/auth';
import Info from '../components/info.js';

export default function Verify() {
  async function verify() {
    const params = new URL(window.location.href).searchParams;
    const token = params.get('token');
    let response;
    if (token) {
      response = await verifyAccount(token);
    }
    setVerifyInfo(response);
  }

  const [verifyInfo, setVerifyInfo] = useState(null);

  useEffect(() => {
    verify();
  }, []);

  if (verifyInfo) {
    if (verifyInfo.success) {
      return (
        <MuiAlert elevation={6} variant="filled" severity="success">
          Your account was successfully verified, click{' '}
          <Link to="/signin" color="inherit">
            Here
          </Link>{' '}
          to login
        </MuiAlert>
      );
    }
    return (
      <MuiAlert elevation={6} variant="filled" severity="error">
        Something went wrong ;(
      </MuiAlert>
    );
  }
  return (
    <Info text="" component={() => <CircularProgress color="inherit" />} />
  );
}

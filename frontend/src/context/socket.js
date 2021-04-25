import React from 'react';
import socketio from "socket.io-client";
import config from '../../env.json';
import { getToken } from '../managers/token-manager';

export const socket = socketio.connect(
  config.BACKEND_HOST + ":" + config.BACKEND_PORT,
  {
    auth: {
      token: getToken()
    }
  }
);

export const SocketContext = React.createContext();

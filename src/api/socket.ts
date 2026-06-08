// import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './client';

let chatSocket: any | null = null;
let notificationSocket: any | null = null;

export const connectSockets = (token: string) => {
  console.log("Mock connectSockets called");
};

export const disconnectSockets = () => {
  console.log("Mock disconnectSockets called");
};

export const getChatSocket = () => chatSocket;
export const getNotificationSocket = () => notificationSocket;

// context/socketContext.js
import React, {createContext, useContext, useEffect, useState} from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'https://evenlyo-backend-20036df510ad.herokuapp.com'; // e.g. 'http://192.168.x.x:3000'
// const SOCKET_URL = 'https://0g01d8wd-5000.inc1.devtunnels.ms'; // e.g. 'http://192.168.x.x:3000'
// const SOCKET_URL = 'https://tk4c2l16-5000.euw.devtunnels.ms/'; // e.g. 'http://192.168.x.x:3000'
export const SocketContext = createContext();

export const SocketProvider = ({children}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🟡 Attempting to connect socket to:', SOCKET_URL);

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Socket successfully connected!');
      console.log('🔗 Socket ID:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connect_error', error => {
      console.log('🚫 Socket connection error:', error.message);
    });

    newSocket.on('disconnect', reason => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('reconnect_attempt', attempt => {
      console.log(`♻️ Reconnection attempt #${attempt}`);
    });

    newSocket.on('reconnect', attempt => {
      console.log(`✅ Socket reconnected after ${attempt} attempts`);
      setIsConnected(true);
    });

    newSocket.on('reconnect_failed', () => {
      console.log('💀 Socket reconnection failed.');
    });

    return () => {
      console.log('🧹 Cleaning up socket connection...');
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{socket, isConnected}}>
      {children}
    </SocketContext.Provider>
  );
};

// ✅ Custom Hook for easy use in any component
export const useSocket = () => useContext(SocketContext);

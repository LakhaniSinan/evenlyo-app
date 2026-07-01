// context/socketContext.js
import React, {createContext, useContext, useEffect, useState} from 'react';
import io from 'socket.io-client';
import {SOCKET_BASE_URL} from '../config/server';

const SOCKET_URL = SOCKET_BASE_URL?.STAGING_SOCKET_BASE_URL;
export const SocketContext = createContext();

export const SocketProvider = ({children}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🟡 Attempting to connect socket to:', SOCKET_URL);

    const newSocket = io(SOCKET_URL);

    setSocket(newSocket);

    newSocket.onAnyOutgoing((event, ...args) => {
      console.log('📤 OUTGOING:', event, args);
    });

    newSocket.onAny((event, ...args) => {
      console.log('📥 INCOMING:', event, args);
    });

    newSocket.on('connect', () => {
      console.log('Connected', newSocket.id);

      console.log('Transport:', newSocket.io.engine.transport.name);

      newSocket.io.engine.on('packet', packet => {
        console.log('PACKET', packet.type, packet);
      });
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

    newSocket.io.on('open', () => {
      console.log('ENGINE OPEN');
    });

    newSocket.io.on('close', reason => {
      console.log('ENGINE CLOSE', reason);
    });

    newSocket.io.engine.on('upgrade', () => {
      console.log('ENGINE UPGRADED TO', newSocket.io.engine.transport.name);
    });

    newSocket.io.engine.on('packet', packet => {
      console.log('PACKET RECEIVED:', packet.type);
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

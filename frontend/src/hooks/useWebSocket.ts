import { useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL } from '../config/api';
import { getToken } from '../utils/tokenStorage';

export type ConnectionStatus = 'LIVE' | 'CONNECTING' | 'RECONNECTING' | 'OFFLINE';

export function useWebSocket(onMessage?: (event: any) => void) {
  const [status, setStatus] = useState<ConnectionStatus>('OFFLINE');
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectDelayRef = useRef<number>(1000); // Start with 1s delay
  const onMessageRef = useRef(onMessage);

  // Keep callback reference updated
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    // Prevent duplicate connection attempts
    if (socketRef.current && (socketRef.current.readyState === WebSocket.CONNECTING || socketRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const token = getToken();
    if (!token) {
      setStatus('OFFLINE');
      return;
    }

    setStatus((prev) => (prev === 'OFFLINE' ? 'CONNECTING' : 'RECONNECTING'));

    // Construct WebSocket URL
    let wsUrl = API_BASE_URL.replace(/^http/, 'ws');
    wsUrl = `${wsUrl}/api/v1/ws?token=${encodeURIComponent(token)}`;

    try {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus('LIVE');
        reconnectDelayRef.current = 1000; // Reset delay on success
        logger("WebSocket connection established");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (onMessageRef.current) {
            onMessageRef.current(payload);
          }
        } catch (err) {
          logger("Failed to parse WebSocket message", err);
        }
      };

      socket.onclose = (event) => {
        socketRef.current = null;
        if (event.code === 4003) {
          logger("WebSocket connection closed due to authentication error.");
          setStatus('OFFLINE');
          return;
        }

        setStatus('OFFLINE');
        logger(`WebSocket closed: ${event.reason || 'No reason provided'}. Attempting reconnect...`);
        scheduleReconnect();
      };

      socket.onerror = () => {
        logger("WebSocket error occurred");
        socket.close();
      };
    } catch (err) {
      logger("Failed to construct WebSocket client", err);
      setStatus('OFFLINE');
      scheduleReconnect();
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Small backoff logic up to a max of 30 seconds
    const delay = reconnectDelayRef.current;
    reconnectDelayRef.current = Math.min(delay * 1.5, 30000);

    reconnectTimeoutRef.current = window.setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      // Remove event handlers to avoid triggering close/reconnect loops during unmount
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      socketRef.current.close();
      socketRef.current = null;
    }
    setStatus('OFFLINE');
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { status, reconnect: connect, disconnect };
}

function logger(msg: string, ...args: any[]) {
  console.log(`[SentinelAI-WS] ${msg}`, ...args);
}

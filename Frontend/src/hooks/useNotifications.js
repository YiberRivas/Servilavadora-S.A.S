import { useState, useEffect, useCallback, useRef } from 'react';
import ENV from '../config/env';
import storage from '../storage';

export default function useNotifications(userUuid) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotification, setLastNotification] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const cancelledRef = useRef(false);

  const connect = useCallback(async () => {
    if (cancelledRef.current || !userUuid) return;
    const token = await storage.getAccessToken();
    if (!token || cancelledRef.current) return;

    const wsUrl = `${ENV.WS_BASE_URL}/ws/notifications/${userUuid}?token=${token}`;
    let ws;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      if (!cancelledRef.current) setConnected(true);
    };

    ws.onmessage = (event) => {
      if (cancelledRef.current) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'new_notification') {
          setLastNotification(msg.data);
          setUnreadCount((prev) => prev + 1);
        } else if (msg.type === 'heartbeat') {
          setUnreadCount(msg.unread_count || 0);
        } else if (msg.type === 'nueva_solicitud' || msg.type === 'asignacion_servicio' || msg.type === 'servicio_asignado') {
          setLastNotification({ ...msg.data, _eventType: msg.type });
        }
      } catch {}
    };

    ws.onerror = () => {};

    ws.onclose = () => {
      if (!cancelledRef.current) {
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 3000);
      }
    };
  }, [userUuid]);

  useEffect(() => {
    cancelledRef.current = false;
    connect();
    return () => {
      cancelledRef.current = true;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
      }
    };
  }, [connect]);

  const clearLastNotification = useCallback(() => {
    setLastNotification(null);
  }, []);

  return {
    unreadCount,
    lastNotification,
    connected,
    clearLastNotification,
  };
}

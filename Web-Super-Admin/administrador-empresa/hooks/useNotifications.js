import { useState, useEffect, useCallback, useRef } from 'react'
import { getToken } from '../../src/services/api'

const WS_BASE_URL = 'ws://localhost:8000'

export function useNotifications(userUuid) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastEvent, setLastEvent] = useState(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const reconnectRef = useRef(null)
  const cancelledRef = useRef(false)

  const connect = useCallback(async () => {
    if (cancelledRef.current || !userUuid) return
    const token = getToken()
    if (!token || cancelledRef.current) return

    const wsUrl = `${WS_BASE_URL}/ws/notifications/${userUuid}?token=${token}`
    let ws
    try {
      ws = new WebSocket(wsUrl)
    } catch {
      return
    }
    wsRef.current = ws

    ws.onopen = () => {
      if (!cancelledRef.current) setConnected(true)
    }

    ws.onmessage = (event) => {
      if (cancelledRef.current) return
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'new_notification') {
          setLastEvent({ ...msg.data, _eventType: msg.type })
          setUnreadCount((prev) => prev + 1)
        } else if (msg.type === 'heartbeat') {
          setUnreadCount(msg.unread_count || 0)
        } else if (msg.type === 'nueva_solicitud') {
          setLastEvent({ ...msg.data, _eventType: msg.type })
        } else if (msg.type === 'asignacion_servicio' || msg.type === 'servicio_asignado') {
          setLastEvent({ ...msg.data, _eventType: msg.type })
        }
      } catch {}
    }

    ws.onerror = () => {}

    ws.onclose = () => {
      if (!cancelledRef.current) {
        setConnected(false)
        reconnectRef.current = setTimeout(connect, 3000)
      }
    }
  }, [userUuid])

  useEffect(() => {
    cancelledRef.current = false
    connect()
    return () => {
      cancelledRef.current = true
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      if (wsRef.current) {
        try { wsRef.current.close() } catch {}
      }
    }
  }, [connect])

  const clearLastEvent = useCallback(() => {
    setLastEvent(null)
  }, [])

  return { unreadCount, lastEvent, connected, clearLastEvent }
}

import { useEffect, useRef } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "/api/v1";

export const useRealtimeStream = (handlers = {}) => {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/realtime/stream`);

    const subscriptions = Object.entries(handlersRef.current)
      .filter(([, handler]) => typeof handler === "function")
      .map(([eventName, handler]) => {
        const listener = (event) => {
          try {
            const payload = JSON.parse(event.data);
            const currentHandler = handlersRef.current[eventName];
            if (typeof currentHandler === "function") {
              currentHandler(payload, event);
            }
          } catch (error) {
            console.error(`Failed to parse realtime event "${eventName}"`, error);
          }
        };

        eventSource.addEventListener(eventName, listener);
        return [eventName, listener];
      });

    eventSource.onerror = () => {
      // Let EventSource retry automatically.
    };

    return () => {
      subscriptions.forEach(([eventName, listener]) => {
        eventSource.removeEventListener(eventName, listener);
      });
      eventSource.close();
    };
  }, []);
};

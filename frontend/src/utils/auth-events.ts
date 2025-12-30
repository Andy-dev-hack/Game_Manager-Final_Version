/**
 * auth-events.ts
 * Simple Event Bus for authentication events.
 * Decouples the API client (Axios) from React components (AuthContext).
 * Allows the API client to signal that a logout is required without directly
 * manipulating the window location or depending on React Context.
 */

type AuthEventType = "AUTH_LOGOUT";

export const AUTH_LOGOUT: AuthEventType = "AUTH_LOGOUT";

type AuthEventListener = () => void;

class AuthEventBus {
  private listeners: Map<AuthEventType, Set<AuthEventListener>>;

  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param event Event type to subscribe to
   * @param callback Function to call when event is emitted
   * @returns Cleanup function to unsubscribe
   */
  on(event: AuthEventType, callback: AuthEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Emit an event to all subscribers
   * @param event Event type to emit
   */
  emit(event: AuthEventType): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error(`Error in auth event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export singleton instance
export const authEvents = new AuthEventBus();

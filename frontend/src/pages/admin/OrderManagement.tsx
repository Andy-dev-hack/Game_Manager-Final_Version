/**
 * OrderManagement.tsx
 * Admin order management component for viewing and searching orders.
 */
import { useState } from "react";
import { useOrders } from "../../hooks/useAdmin";
import { getErrorMessage } from "../../utils/error.util";
import styles from "./UserManagement.module.css"; // Reuse existing styles for consistency

/**
 * Interface for order item
 */
interface OrderItem {
  game?: string;
  title: string;
  price?: number;
}

/**
 * Interface for order data
 */
interface Order {
  _id: string;
  user?: {
    username: string;
    email: string;
  };
  items?: OrderItem[];
  totalAmount?: number;
  createdAt: string;
  status?: string;
}

const OrderManagement = () => {
  const { data: orders, isLoading, error } = useOrders();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders?.filter((order: Order) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesId = order._id.toLowerCase().includes(searchLower);
    const matchesUser =
      order.user?.username.toLowerCase().includes(searchLower) ||
      order.user?.email.toLowerCase().includes(searchLower);
    return matchesId || matchesUser;
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando pedidos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {getErrorMessage(error)}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestión de Pedidos</h1>
        <p className={styles.subtitle}>
          Total de pedidos: <strong>{orders?.length || 0}</strong>
        </p>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Buscar por ID de pedido o usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Usuario</th>
              <th>Juegos</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map((order: Order) => (
              <tr key={order._id}>
                <td className={styles.orderIdCell}>
                  {order._id.slice(-6).toUpperCase()}
                </td>
                <td>
                  <div className={styles.username}>
                    {order.user?.username || "Usuario eliminado"}
                  </div>
                  <div className={styles.userEmail}>{order.user?.email}</div>
                </td>
                <td>
                  {order.items?.map((item: OrderItem) => (
                    <div
                      key={item.game || item.title}
                      className={styles.orderItemTitle}
                    >
                      • {item.title}
                    </div>
                  ))}
                </td>
                <td className={styles.totalAmount}>
                  ${order.totalAmount?.toFixed(2)}
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`${styles.badge} ${
                      order.status === "completed"
                        ? styles.badgeSuccess
                        : styles.badgePending
                    }`}
                  >
                    {order.status || "COMPLETED"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;

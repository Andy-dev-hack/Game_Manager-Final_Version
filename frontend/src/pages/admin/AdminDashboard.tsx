import { Link } from "react-router-dom";
import { FaUsers, FaGamepad, FaDownload } from "react-icons/fa";
import DashboardStats from "./DashboardStats";
import styles from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const adminCards = [
    {
      title: "Gestión de Usuarios",
      description: "Ver, buscar y eliminar usuarios del sistema",
      icon: <FaUsers />,
      link: "/admin/users",
      color: "blue",
    },
    {
      title: "Gestión de Juegos",
      description: "Editar y eliminar juegos del catálogo",
      icon: <FaGamepad />,
      link: "/admin/games",
      color: "purple",
    },
    {
      title: "Gestión de Pedidos",
      description: "Visualizar el historial de compras de los usuarios",
      icon: <FaDownload />, // Keeping icon or changing to something else if preferred
      link: "/admin/orders",
      color: "green",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Panel de Administración</h1>
        <p className={styles.subtitle}>
          Gestiona el catálogo de juegos y los usuarios del sistema
        </p>
      </div>

      <div className={styles.grid}>
        {adminCards.map((card) => (
          <Link
            key={card.link}
            to={card.link}
            className={`${styles.card} ${styles[`card${card.color}`]}`}
          >
            <div className={styles.cardIcon}>{card.icon}</div>
            <h3 className={styles.cardTitle}>{card.title}</h3>
            <p className={styles.cardDescription}>{card.description}</p>
            <div className={styles.cardArrow}>→</div>
          </Link>
        ))}
      </div>

      {/* Dashboard Metrics */}
      <DashboardStats />

      <div className={styles.infoBox}>
        <h3>ℹ️ Información Importante</h3>
        <ul>
          <li>
            <strong>Cascade Delete:</strong> Al eliminar un usuario, se borran
            automáticamente su biblioteca, órdenes y tokens de sesión.
          </li>
          <li>
            <strong>Cascade Delete:</strong> Al eliminar un juego, desaparece de
            todas las bibliotecas de usuarios.
          </li>
          <li>
            <strong>Credenciales de prueba:</strong> admin@test.com / admin123
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;

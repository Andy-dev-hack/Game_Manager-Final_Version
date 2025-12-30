import {
  FaUsers,
  FaGamepad,
  FaShoppingBag,
  FaMoneyBillWave,
  FaGem, // For ARPU
  FaBalanceScale, // For Pareto
  FaBookOpen, // For Engagement
  FaRocket, // For Efficiency
} from "react-icons/fa";
/**
 * DashboardStats.tsx
 * Admin dashboard statistics component displaying KPIs, top games, and sales trends.
 */
import { useDashboardStats, usePublicStats } from "../../hooks/useAdmin";
import { getErrorMessage } from "../../utils/error.util";
import styles from "./DashboardStats.module.css";

const DashboardStats = () => {
  const {
    data: dashboardStats,
    isLoading: isLoadingDashboard,
    error: dashboardError,
  } = useDashboardStats();

  const {
    data: publicStats,
    isLoading: isLoadingPublic,
    error: publicError,
  } = usePublicStats();

  const isLoading = isLoadingDashboard || isLoadingPublic;
  const error = dashboardError || publicError;

  if (isLoading)
    return <div className={styles.loading}>Cargando estadísticas...</div>;
  if (error)
    return <div className={styles.error}>Error: {getErrorMessage(error)}</div>;

  if (!dashboardStats || !publicStats) return null;

  // --- Derived BI Metrics (Frontend Only) ---
  const totalRevenue = dashboardStats.revenue || 0;
  const totalUsers = publicStats.totalUsers || 1;
  const totalGames = publicStats.totalGames || 1;
  const totalCollections = publicStats.totalCollections || 0;
  const top5Revenue = dashboardStats.topSelling.reduce((acc, curr) => acc + curr.revenue, 0);

  const arpu = totalRevenue / totalUsers;
  const paretoRatio = totalRevenue > 0 ? (top5Revenue / totalRevenue) * 100 : 0;
  const gamesPerUser = totalUsers > 0 ? totalCollections / totalUsers : 0;
  const revenuePerGame = totalGames > 0 ? totalRevenue / totalGames : 0;

  return (
    <div className={styles.container}>
      {/* 0. BI Grid (Premium Stats) */}
      <div className={styles.biGrid}>
         {/* ARPU Card */}
         <div className={`${styles.premiumCard} ${styles.arpuCard}`}>
            <div className={styles.premiumContent}>
               <h3>💎 Valor por Usuario (ARPU)</h3>
               <div className={`${styles.premiumValue} ${styles.arpuColor}`}>
                  ${arpu.toFixed(2)}
               </div>
               <div className={styles.premiumSub}>
                  Ingreso medio generado por usuario registrado
               </div>
            </div>
            <div className={`${styles.premiumIcon} ${styles.arpuColor}`}>
               <FaGem />
            </div>
         </div>

         {/* Pareto Card */}
         <div className={`${styles.premiumCard} ${styles.paretoCard}`}>
            <div className={styles.premiumContent}>
               <h3>⚖️ Concentración Top 5</h3>
               <div className={`${styles.premiumValue} ${styles.paretoColor}`}>
                  {paretoRatio.toFixed(1)}%
               </div>
               <div className={styles.premiumSub}>
                  De ingresos provienen de solo 5 juegos
               </div>
            </div>
            <div className={`${styles.premiumIcon} ${styles.paretoColor}`}>
               <FaBalanceScale />
            </div>
         </div>
      </div>

      {/* 1. KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.iconWrapper} ${styles.green}`}>
            <FaMoneyBillWave />
          </div>
          <div className={styles.kpiContent}>
            <h3>Ingresos Totales</h3>
            <p>${dashboardStats.revenue.toFixed(2)}</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.iconWrapper} ${styles.orange}`}>
            <FaMoneyBillWave />
          </div>
          <div className={styles.kpiContent}>
            <h3>Ticket Medio</h3>
            <p>${dashboardStats.averageOrderValue?.toFixed(2) || "0.00"}</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.iconWrapper} ${styles.blue}`}>
            <FaUsers />
          </div>
          <div className={styles.kpiContent}>
            <h3>Usuarios</h3>
            <p>{publicStats.totalUsers}</p>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.iconWrapper} ${styles.purple}`}>
            <FaShoppingBag />
          </div>
          <div className={styles.kpiContent}>
            <h3>Compras</h3>
            <p>{publicStats.totalCollections}</p>
          </div>
        </div>
      </div>

      {/* 1.5 Secondary BI Grid (Engagement & Efficiency) */}
      <div className={styles.biGrid}>
         {/* Engagement Card */}
         <div className={`${styles.premiumCard} ${styles.engagementCard}`}>
            <div className={styles.premiumContent}>
               <h3>📚 Engagement</h3>
               <div className={`${styles.premiumValue} ${styles.engagementColor}`}>
                  {gamesPerUser.toFixed(1)}
               </div>
               <div className={styles.premiumSub}>
                  Juegos comprados por usuario (Media)
               </div>
            </div>
            <div className={`${styles.premiumIcon} ${styles.engagementColor}`}>
               <FaBookOpen />
            </div>
         </div>

         {/* Efficiency Card */}
         <div className={`${styles.premiumCard} ${styles.efficiencyCard}`}>
            <div className={styles.premiumContent}>
               <h3>🚀 Rentabilidad Catálogo</h3>
               <div className={`${styles.premiumValue} ${styles.efficiencyColor}`}>
                  ${revenuePerGame.toFixed(2)}
               </div>
               <div className={styles.premiumSub}>
                  Ingresos generados por cada título
               </div>
            </div>
            <div className={`${styles.premiumIcon} ${styles.efficiencyColor}`}>
               <FaRocket />
            </div>
         </div>
      </div>

      <div className={styles.detailsGrid}>
        {/* 2. Top Games Table */}
        <div className={styles.detailsCard}>
          <h3>🏆 Top 5 Juegos Más Vendidos</h3>
          <div className={styles.rankList}>
             {/* Using new rankList class */}
            <ul>
              {dashboardStats.topSelling.map((game, index) => (
                <li key={game._id} className={styles.rankItem}>
                   <div className={styles.rankInfo}>
                      <div className={`${styles.rankBadge} ${index === 0 ? styles.rank1 : index === 1 ? styles.rank2 : index === 2 ? styles.rank3 : ''}`}>
                        {index + 1}
                      </div>
                      <span className={styles.gameName}>{game.title}</span>
                   </div>
                  <div className={styles.gameStats}>
                     <span style={{ fontSize: '0.8rem', color: '#666', marginRight: '0.5rem' }}>
                        (${game.unitPrice?.toFixed(2) || "?"})
                     </span>
                    <span className={styles.soldBadge}>
                      {game.totalSold} u.
                    </span>
                    <span className={styles.revenueBadge}>
                      ${game.revenue.toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Monthly Trends */}
        <div className={styles.detailsCard}>
          <h3>💰 Ingresos Mensuales</h3>
          <div className={styles.platformList}>
             <div className={styles.trendHeader}>
                <span>Mes</span>
                <span>Ingresos Generados</span>
             </div>
            {dashboardStats.monthlyTrends.map((trend) => (
              <div key={trend._id} className={styles.trendRow}>
                <span className={styles.trendLabel}>{trend._id}</span>
                <div className={styles.trendBarContainer}>
                  <div
                    className={styles.trendBarFill}
                    style={{
                      width: `${Math.min(
                        (trend.revenue / (dashboardStats.revenue || 1)) * 100 * 5,
                        100
                      )}%`,
                    }}
                  />
                  <span style={{
                     position: 'absolute', left: '10px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)',
                     lineHeight: '24px'
                  }}>
                     {trend.orders} órdenes
                  </span>
                </div>
                <span className={styles.trendValueLabel}>
                  ${trend.revenue.toFixed(2)}
                </span>
              </div>
            ))}
            {dashboardStats.monthlyTrends.length === 0 && (
              <div className={styles.emptyState}>No hay datos de tendencias aún.</div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        {/* 4. Genres & Platforms */}
        <div className={styles.detailsCard}>
          <h3>🎮 Plataformas y Géneros</h3>
          <div className={styles.platformList} style={{ marginBottom: "2rem" }}>
            <h4
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <FaGamepad/> Plataformas
            </h4>
            {dashboardStats.platforms?.map((p) => {
              const percentage = ((p.count / (publicStats.totalGames || 1)) * 100).toFixed(1);
              return (
              <div key={p.name} className={styles.platformItem}>
                <span className={styles.platformName}>{p.name}</span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      background: "linear-gradient(90deg, #2196f3 0%, #00bcd4 100%)", // Blue-Cyan gradient
                      width: `${Math.min((p.count / (publicStats.totalGames || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', minWidth: '80px', justifyContent: 'flex-end' }}>
                   <span style={{ fontWeight: 'bold', color: '#fff' }}>{p.count}</span>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>({percentage}%)</span>
                </div>
              </div>
            )})}
          </div>

          <div className={styles.platformList}>
             <h4
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                marginBottom: "0.5rem",
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
               💡 Géneros Top
            </h4>
            {dashboardStats.genres?.map((g) => {
               const percentage = ((g.count / (publicStats.totalGames || 1)) * 100).toFixed(1);
               return (
              <div key={g.name} className={styles.platformItem}>
                <span className={styles.platformName}>{g.name}</span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      backgroundColor: "#9c27b0",
                      width: `${Math.min(
                        (g.count / (publicStats.totalGames || 1)) * 100, 100 // Remove 3x boost
                      )}%`,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', minWidth: '80px', justifyContent: 'flex-end' }}>
                   <span style={{ fontWeight: 'bold', color: '#fff' }}>{g.count}</span>
                   <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>({percentage}%)</span>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* 5. Library Stats */}
        <div className={styles.detailsCard}>
          <h3>❤️ Top en Bibliotecas</h3>
           {/* Converted to Rank List style for consistency */}
          <div className={styles.rankList}>
             <ul>
              {dashboardStats.libraryStats?.map((game, index) => (
                <li key={game.title} className={styles.rankItem}>
                   <div className={styles.rankInfo}>
                      <div className={`${styles.rankBadge} ${styles.smallBadge}`}>
                        {index + 1}
                      </div>
                      <span className={styles.gameName}>{game.title}</span>
                   </div>
                  <span style={{fontWeight: "bold", color: "#e91e63"}}>
                    {game.count} ❤️
                  </span>
                </li>
              ))}
              {(!dashboardStats.libraryStats ||
                dashboardStats.libraryStats.length === 0) && (
                 <div className={styles.emptyState}>Sin datos aún.</div>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;

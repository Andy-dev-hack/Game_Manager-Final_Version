import React from "react";
import { Link } from "react-router-dom";
import { useGames } from "../../games/hooks/useGames";
import styles from "./AutoScrollGameList.module.css";

export const AutoScrollGameList: React.FC = () => {
  // Fetch a good amount of games to populate the list
  const { data, isLoading } = useGames({ limit: 15 });
  // Derived state (no useState/useEffect needed)
  // Derived state (no useState/useEffect needed)
  const allGames = data?.data || [];

  // Duplicate for infinite scroll effect
  const games = [...allGames, ...allGames];

  if (isLoading || games.length === 0) return null;

  // Chunk games into groups of 3 for the rows
  const rows = [];
  for (let i = 0; i < games.length; i += 3) {
    rows.push(games.slice(i, i + 3));
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollContainer}>
        <div className={styles.track}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.row}>
              {row.map((game, gameIndex) => (
                <Link
                  to={`/game/${game._id}`}
                  key={`${rowIndex}-${gameIndex}-${game._id}`}
                  className={styles.gameCard}
                  title={game.title}
                >
                  <img
                    src={
                      game.assets?.cover ||
                      "https://placehold.co/600x400/101010/FFF?text=No+Cover"
                    }
                    alt={game.title}
                    className={styles.gameImage}
                    loading="lazy"
                  />
                  <div className={styles.gameOverlay}>
                    <p className={styles.gameTitle}>{game.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

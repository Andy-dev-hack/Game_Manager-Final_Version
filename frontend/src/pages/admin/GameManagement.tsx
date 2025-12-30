import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { gamesService } from "../../services/games.service";
import { useDeleteGame } from "../../hooks/useAdmin";
import { FaTrash } from "react-icons/fa";
import { handleApiError, getErrorMessage } from "../../utils/error.util";
import styles from "./GameManagement.module.css";

const GameManagement = () => {
  const [search, setSearch] = useState("");
  const deleteGameMutation = useDeleteGame();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["admin", "games", search],
    queryFn: ({ pageParam = 1 }) =>
      gamesService.getCatalog({ page: pageParam, limit: 20, query: search }),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.pagination;
      return page < pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const handleDeleteGame = async (gameId: string, gameTitle: string) => {
    if (
      window.confirm(
        `¿Estás seguro de eliminar "${gameTitle}"?\n\nEsto eliminará el juego del catálogo y de todas las bibliotecas de usuarios.`
      )
    ) {
      try {
        await deleteGameMutation.mutateAsync(gameId);
        alert("Juego eliminado correctamente");
      } catch (error) {
        handleApiError(error, "Failed to delete game");
      }
    }
  };

  const allGames = data?.pages.flatMap((page) => page.data) || [];
  const totalGames = data?.pages[0]?.pagination.total || 0;

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
        <h1>Gestión de Juegos</h1>
        <p className={styles.subtitle}>
          Total en catálogo: <strong>{totalGames}</strong>
        </p>
      </div>

      {/* Search Bar */}
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="Buscar juegos por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Cargando catálogo...</div>
      ) : (
        <>
          <div className={styles.grid}>
            {allGames.map((game) => (
              <div key={game._id} className={styles.card}>
                <div
                  className={styles.cardImage}
                  style={
                    {
                      "--bg-image": `url(${
                        game.assets?.cover ||
                        "https://placehold.co/300x400/1a1a1a/666?text=No+Image"
                      })`,
                    } as React.CSSProperties
                  }
                />
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{game.title}</h3>
                  <div className={styles.cardMeta}>
                    <span className={styles.badge}>
                      {game.platforms?.join(", ")}
                    </span>
                    {game.score && (
                      <span className={styles.score}>⭐ {game.score}/10</span>
                    )}
                  </div>
                  <div className={styles.cardPrice}>
                    {game.price > 0 ? `$${game.price}` : "Free"}
                  </div>
                </div>
                <div className={styles.cardActions}>

                  <button
                    className={styles.btnDelete}
                    onClick={() => handleDeleteGame(game._id, game.title)}
                    disabled={deleteGameMutation.isPending}
                  >
                    <FaTrash /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hasNextPage && (
            <div className={styles.loadMore}>
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className={styles.loadMoreBtn}
              >
                {isFetchingNextPage ? "Cargando..." : "Cargar Más"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameManagement;

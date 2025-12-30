import { useLibrary } from "./useLibrary";

/**
 * useIsGameOwned hook
 * Checks if a specific game is in the authenticated user's library.
 *
 * @param gameId - ID of the game to check
 * @returns {boolean} True if owned, false otherwise
 */
export const useIsGameOwned = (gameId: string): boolean => {
    const { data: library = [] } = useLibrary();

    if (!library) return false;

    return library.some((item) => item.game._id === gameId);
};

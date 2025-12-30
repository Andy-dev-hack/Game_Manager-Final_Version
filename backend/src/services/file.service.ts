/**
 * @file file.service.ts
 * @description Abstracts file system operations to decouple business logic from storage implementation.
 * Currently handles local file deletion.
 */
import fs from "fs-extra";
import path from "path";
import logger from "../utils/logger";

// Destination: Used by AuthService.updateUserProfile (src/services/auth.service.ts) to remove old profile pictures.
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    const absolutePath = path.resolve(filePath);
    // Verificar si existe antes de intentar borrar para evitar errores ruidosos
    if (await fs.pathExists(absolutePath)) {
      await fs.remove(absolutePath);
    }
  } catch (error) {
    // Loguear error pero no detener el flujo principal (borrar una foto vieja no es crítico)
    logger.error(`Error deleting file ${filePath}: ${error}`);
  }
};

import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, "../../data/games.short.json");
const rawData = fs.readFileSync(filePath, "utf-8");
const games = JSON.parse(rawData);

const updatedGames = games.map((game: any) => {
  // Convert platform to platforms
  if (game.platform && !game.platforms) {
    game.platforms = Array.isArray(game.platform)
      ? game.platform
      : [game.platform];
  }
  delete game.platform;

  // Specific overrides
  if (game.title === "Hollow Knight") {
    game.platforms = ["PC", "Xbox Series X", "Nintendo Switch"];
  }
  if (game.title === "God of War Ragnarök") {
    game.platforms = ["PlayStation 5", "PlayStation 4", "PC"];
  }

  return game;
});

fs.writeFileSync(filePath, JSON.stringify(updatedGames, null, 4));
console.log("Updated games.short.json");

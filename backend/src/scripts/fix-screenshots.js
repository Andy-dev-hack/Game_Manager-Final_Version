const mongoose = require("mongoose");
const axios = require("axios");
require("dotenv").config();

// Define minimal schema inline to avoid importing TS model
const GameSchema = new mongoose.Schema(
    {
        title: String,
        rawgId: Number,
        image: String,
        assets: {
            cover: String,
            screenshots: [String],
            videos: [String],
        },
    },
    { strict: false }
); // Strict false to allow other fields to exist without being defined here

const Game = mongoose.model("Game", GameSchema);

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_API_URL = "https://api.rawg.io/api";

const getGameDetails = async (rawgId) => {
    const response = await axios.get(`${RAWG_API_URL}/games/${rawgId}`, {
        params: { key: RAWG_API_KEY },
    });

    const gameData = response.data;
    const screenshots = [gameData.background_image_additional, ...(gameData.short_screenshots || [])]
        .map((s) => s && (s.image || s)) // Handle structure diffs
        .filter((s) => s);

    // Actually RAWG /games/:id returns 'background_image' and 'background_image_additional'.
    // We might want to fetch /games/:id/screenshots endpoint for better list,
    // but existing service uses a different approach. Let's try to match existing logic if possible,
    // or just hit the screenshots endpoint which is cleaner.

    // Fetches screenshots explicitly
    const screensResponse = await axios.get(`${RAWG_API_URL}/games/${rawgId}/screenshots`, {
        params: { key: RAWG_API_KEY },
    });

    const finalScreenshots = screensResponse.data.results.map((s) => s.image);

    return {
        image: gameData.background_image,
        screenshots: finalScreenshots,
        title: gameData.name,
    };
};

const fix = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const gameId = "6942790a8c6eb5d301e03ad4";
        // Also find others with missing shots
        const games = await Game.find({
            $or: [
                { _id: gameId },
                { "assets.screenshots": { $size: 0 } },
                { "assets.screenshots": { $exists: false } },
            ],
        });

        console.log(`Found ${games.length} games to check/fix.`);

        for (const game of games) {
            if (!game.rawgId) {
                console.log(`Skipping ${game.title} (No RAWG ID)`);
                continue;
            }

            console.log(`Fixing ${game.title} (${game.rawgId})...`);

            try {
                const details = await getGameDetails(game.rawgId);

                if (details.screenshots && details.screenshots.length > 0) {
                    if (!game.assets) game.assets = {};
                    game.assets.screenshots = details.screenshots;
                    if (!game.image) game.image = details.image;
                    if (!game.assets.cover) game.assets.cover = details.image;

                    // Fix common.free title if present
                    if (game.title === "common.free") game.title = details.title;

                    await game.save();
                    console.log(`✅ Updated ${game.title}`);
                } else {
                    console.log(`❌ No screens found for ${game.title}`);
                }
            } catch (err) {
                console.error(`Failed to update ${game.title}: ${err.message}`);
            }
        }

        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error("Script error:", err);
        process.exit(1);
    }
};

fix();

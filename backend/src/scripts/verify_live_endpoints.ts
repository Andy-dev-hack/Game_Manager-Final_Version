import axios from "axios";

const API_URL = "http://localhost:3500/api";
const TIMESTAMP = Date.now();
const USERNAME = `verify_admin_${TIMESTAMP}`;
const EMAIL = `verify_${TIMESTAMP}@test.com`;
const PASSWORD = "password123";

let token = "";
let userId = "";
let gameId = "";
let collectionId = "";

const log = (msg: string) => console.log(`[VERIFY] ${msg}`);
const error = (msg: string, err: any) => {
  console.error(`[ERROR] ${msg}`);
  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Data:", JSON.stringify(err.response.data, null, 2));
  } else {
    console.error("Message:", err.message);
  }
  process.exit(1);
};

const run = async () => {
  try {
    // 1. Register Admin
    log("1. Registering Admin...");
    const regRes = await axios.post(
      `${API_URL}/users/register`,
      {
        username: USERNAME,
        email: EMAIL,
        password: PASSWORD,
        role: "admin",
      },
      { headers: { "Content-Type": "application/json" } }
    );
    userId = regRes.data.user._id;
    log("   -> Admin registered: " + userId);

    // 2. Login
    log("2. Logging in...");
    const loginRes = await axios.post(`${API_URL}/users/login`, {
      email: EMAIL,
      password: PASSWORD,
    });
    token = loginRes.data.token;
    log("   -> Logged in. Token received.");

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. Create Game
    log("3. Creating Game...");
    const gameRes = await axios.post(
      `${API_URL}/games`,
      {
        title: `Verify Game ${TIMESTAMP}`,
        genre: "Test",
        platform: "PC",
        price: 10,
        currency: "USD",
      },
      authHeaders
    );
    gameId = gameRes.data.game._id;
    log("   -> Game created: " + gameId);

    // 4. Get Games
    log("4. Getting Games...");
    const getGamesRes = await axios.get(
      `${API_URL}/games?query=Verify`,
      authHeaders
    );
    if (getGamesRes.data.games.length === 0)
      throw new Error("Game not found in search");
    log("   -> Games found: " + getGamesRes.data.games.length);

    // 5. Update Game
    log("5. Updating Game...");
    await axios.put(
      `${API_URL}/games/${gameId}`,
      {
        price: 20,
      },
      authHeaders
    );
    log("   -> Game updated.");

    // 6. Add to Collection
    log("6. Adding to Collection...");
    const colRes = await axios.post(
      `${API_URL}/collection`,
      {
        gameId: gameId,
        status: "playing",
      },
      authHeaders
    );
    // Fixed: Controller returns { message, item }
    collectionId = colRes.data.item._id;
    log("   -> Added to collection: " + collectionId);

    // 7. Update Collection
    log("7. Updating Collection...");
    await axios.put(
      `${API_URL}/collection/${collectionId}`,
      {
        status: "completed",
        score: 10,
      },
      authHeaders
    );
    log("   -> Collection updated.");

    // 8. Payment
    log("8. Processing Payment...");
    const payRes = await axios.post(
      `${API_URL}/payments/checkout`,
      {
        gameIds: [gameId],
      },
      authHeaders
    );
    if (!payRes.data.success) throw new Error("Payment failed");
    log("   -> Payment successful: " + payRes.data.orderId);

    // 9. Delete Game (Admin)
    log("9. Deleting Game...");
    await axios.delete(`${API_URL}/games/${gameId}`, authHeaders);
    log("   -> Game deleted.");

    // 10. Delete User (Admin)
    log("10. Deleting User...");
    await axios.delete(`${API_URL}/users/${userId}`, authHeaders);
    log("   -> User deleted.");

    console.log("\n✅ ALL CHECKS PASSED SUCCESSFULLY!");
  } catch (err: any) {
    error("Verification failed", err);
  }
};

run();

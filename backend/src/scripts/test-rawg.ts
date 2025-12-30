import axios from "axios";

const KEY = process.env.RAWG_API_KEY;

async function test() {
  console.log("1. Testing PC Platform only...");
  try {
    const res = await axios.get("https://api.rawg.io/api/games", {
      params: { key: KEY, platforms: 4, page_size: 1 },
    });
    console.log(`PC Games Count: ${res.data.count}`);
  } catch (e: any) {
    console.error("PC Fail", e.message);
  }

  console.log("\n2. Searching Games with TAG 'horror'...");
  try {
    const res = await axios.get("https://api.rawg.io/api/games", {
      params: { key: KEY, platforms: 4, tags: "horror", page_size: 5 },
    });
    console.log(`Horror TAG Count: ${res.data.count}`);
    if (res.data.results?.length > 0) {
      console.log("Example:", res.data.results[0].name);
    }
  } catch (e: any) {
    console.error("Tag Fail", e.message);
  }
}

test();

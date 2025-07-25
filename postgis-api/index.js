import dotenv from "dotenv";
import app from "./app.js";
import { setupDatabase } from "./db/initTables.js";
import importCounties from "./scripts/importEasternShore.js";

dotenv.config();

const port = process.env.PORT || 5000;

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  
  try {
    await setupDatabase();
    await importCounties();
  } catch (err) {
    console.error("Failed to setup database or import counties:", err);
  }
});
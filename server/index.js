require("dotenv").config();
const { createApp } = require("./app");
const { connectDb } = require("./config/db");
const { configureCloudinary } = require("./config/cloudinary");

const PORT = process.env.PORT || 5000;

async function main() {
  configureCloudinary();
  await connectDb();
  const app = createApp();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

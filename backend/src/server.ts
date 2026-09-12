import "dotenv/config";
import { buildApp } from "./app";
import { connectDb } from "./shared/db";
import { itemService } from "./modules/item/item.service";
import { ensureDemoDataSeeded } from "./shared/demo-seed";

const PORT = Number(process.env.PORT ?? 4000);

connectDb().then(async () => {
  await itemService.ensureSeeded();
  await ensureDemoDataSeeded();
  buildApp().listen(PORT, () => {
    console.log(JSON.stringify({ level: "INFO", module: "server", message: `Listening on ${PORT}` }));
  });
});

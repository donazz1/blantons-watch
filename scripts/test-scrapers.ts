import { STORE_SEEDS } from "../src/lib/stores-config";
import { checkStoreStock, statusLabel } from "../src/lib/scrapers";

async function main() {
  console.log("Testing scrapers...\n");
  for (const store of STORE_SEEDS) {
    const result = await checkStoreStock({
      slug: store.slug,
      url: store.url,
    });
    console.log(
      `${store.slug.padEnd(22)} ${statusLabel(result.status).padEnd(14)} ${result.detail}`,
    );
  }
}

main().catch(console.error);

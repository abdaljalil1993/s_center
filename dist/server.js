"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_source_1 = require("./config/data-source");
const env_1 = require("./config/env");
const app_1 = require("./app");
async function bootstrap() {
    await data_source_1.AppDataSource.initialize();
    app_1.app.listen(env_1.env.PORT, () => {
        // Intentionally minimal startup output.
        console.log(`Student Bot backend listening on port ${env_1.env.PORT}`);
    });
}
bootstrap().catch((error) => {
    console.error('Failed to start server:');
    if (error instanceof Error) {
        console.error(error.message);
        console.error(error.stack);
    }
    else {
        console.error(error);
    }
    process.exit(1);
});

/// <reference types="node" />
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config();

export default defineConfig({
  schema: "./src/infrastructure/persistence/prisma/schema.prisma",
  migrations: {
    path: "./src/infrastructure/persistence/prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});

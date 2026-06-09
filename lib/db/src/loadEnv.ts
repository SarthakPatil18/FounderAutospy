import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Helper to load the .env file from the workspace root
const loadEnv = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Traverse upwards from __dirname to find the root folder containing pnpm-workspace.yaml
    let currentDir = __dirname;
    let rootDir = "";
    while (currentDir !== path.parse(currentDir).root) {
      if (fs.existsSync(path.join(currentDir, "pnpm-workspace.yaml"))) {
        rootDir = currentDir;
        break;
      }
      currentDir = path.dirname(currentDir);
    }
    
    if (!rootDir) {
      rootDir = process.cwd();
    }
    
    const envPath = path.join(rootDir, ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      for (const line of envContent.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        
        const firstEq = trimmed.indexOf("=");
        if (firstEq === -1) continue;
        
        const key = trimmed.substring(0, firstEq).trim();
        let val = trimmed.substring(firstEq + 1).trim();
        
        // Strip quotes if present
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
    
    // Make sure DATABASE_URL is an absolute path relative to rootDir
    // to ensure Prisma resolves it correctly regardless of process.cwd()
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("file:")) {
      const relativeDbPath = process.env.DATABASE_URL.substring(5);
      if (!path.isAbsolute(relativeDbPath)) {
        const absoluteDbPath = path.resolve(rootDir, "lib", "dev.db");
        process.env.DATABASE_URL = `file:${absoluteDbPath}`;
      }
    }
  } catch (error) {
    console.error("Warning: Failed to load .env file dynamically:", error);
  }
};

loadEnv();

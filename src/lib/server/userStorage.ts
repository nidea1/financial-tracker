import { promises as fs } from "fs";
import path from "path";
import { StorageShape, UserRecord } from "@/lib/types";

const USERS_DIR = path.join(process.cwd(), "data", "users");

const safeFilename = (username: string) => {
  if (!username) return `user-${Date.now()}`;
  // lowercase, replace invalid chars with '-', prevent traversal
  const cleaned = username.toLowerCase().replace(/[^a-z0-9._-]/g, "-").replace(/(^[.-]+|[.-]+$)/g, "");
  return cleaned || `user-${Date.now()}`;
};

const ensureUsersDir = async () => {
  await fs.mkdir(USERS_DIR, { recursive: true });
};

export const userFilePath = (username: string) => {
  const name = safeFilename(username);
  return path.join(USERS_DIR, `${name}.json`);
};

export const readUserFile = async (username: string): Promise<UserRecord | null> => {
  await ensureUsersDir();
  const file = userFilePath(username);
  try {
    const raw = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && "record" in parsed) {
      return (parsed as { record: UserRecord }).record;
    }
    return parsed as UserRecord;
  } catch {
    return null;
  }
};

export const writeUserFile = async (username: string, record: UserRecord) => {
  await ensureUsersDir();
  const file = userFilePath(username);
  const payload = {
    updatedAt: new Date().toISOString(),
    record,
  };

  const tmp = `${file}.tmp-${Date.now()}`;
  await fs.writeFile(tmp, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  await fs.rename(tmp, file);
};

export const listUserFiles = async (): Promise<string[]> => {
  try {
    await ensureUsersDir();
    const files = await fs.readdir(USERS_DIR);
    return files.filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
};

// Migrate a StorageShape (single-file) into per-user files. Returns created filenames.
export const migrateStorageShapeToPerUser = async (storage: StorageShape) => {
  await ensureUsersDir();
  const created: string[] = [];
  for (const [username, record] of Object.entries(storage.users ?? {})) {
    const file = userFilePath(username);
    const payload = { updatedAt: new Date().toISOString(), record };
    await fs.writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
    created.push(file);
  }
  return created;
};

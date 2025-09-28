import { promises as fs } from "fs";
import path from "path";
import { StorageShape } from "@/lib/types";

const STORAGE_FILE_PATH = path.join(process.cwd(), "data", "storage.json");

const DEFAULT_STORAGE: StorageShape = {
  users: {},
};

const ensureStorageFile = async () => {
  try {
    await fs.access(STORAGE_FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(STORAGE_FILE_PATH), { recursive: true });
    await fs.writeFile(
      STORAGE_FILE_PATH,
      JSON.stringify(DEFAULT_STORAGE, null, 2),
      "utf-8"
    );
  }
};

export const readStorageFile = async (): Promise<StorageShape> => {
  await ensureStorageFile();

  try {
    const raw = await fs.readFile(STORAGE_FILE_PATH, "utf-8");
    if (!raw.trim()) {
      return DEFAULT_STORAGE;
    }

    const parsed = JSON.parse(raw) as StorageShape;
    if (!parsed || typeof parsed !== "object" || !parsed.users) {
      return DEFAULT_STORAGE;
    }

    return {
      ...DEFAULT_STORAGE,
      ...parsed,
      users: parsed.users ?? {},
    } satisfies StorageShape;
  } catch (error) {
    console.warn("Falling back to default storage due to read error", error);
    return DEFAULT_STORAGE;
  }
};

export const writeStorageFile = async (data: StorageShape) => {
  await ensureStorageFile();

  const payload: StorageShape = {
    ...DEFAULT_STORAGE,
    ...data,
    users: data.users ?? {},
  };

  await fs.writeFile(
    STORAGE_FILE_PATH,
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf-8"
  );
};

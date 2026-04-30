import fs from "fs";
import path from "path";

const uploadRoot = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "uploads");

const sanitizeSegment = (value) =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const ensureUploadRoot = async () => {
  await fs.promises.mkdir(uploadRoot, { recursive: true });
};

export const buildUploadPath = ({ userId, uploadGroup, fileName }) => {
  const safeUserId = sanitizeSegment(userId) || "unknown-user";
  const safeUploadGroup = sanitizeSegment(uploadGroup) || "group";
  const safeFileName = sanitizeSegment(fileName) || "upload";

  return path.join(safeUserId, safeUploadGroup, safeFileName);
};

export const resolveUploadPath = (relativeFilePath) => {
  const normalizedPath = path
    .normalize(relativeFilePath)
    .replace(/^([.][.][/\\])+/, "");
  const absolutePath = path.join(uploadRoot, normalizedPath);
  const relativePath = path.relative(uploadRoot, absolutePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Invalid upload path.");
  }

  return absolutePath;
};

export const storeUploadFile = async ({ sourceFilePath, destinationPath }) => {
  const absolutePath = resolveUploadPath(destinationPath);

  await fs.promises.mkdir(path.dirname(absolutePath), { recursive: true });

  try {
    await fs.promises.rename(sourceFilePath, absolutePath);
  } catch (error) {
    if (error.code !== "EXDEV") {
      throw error;
    }

    await fs.promises.copyFile(sourceFilePath, absolutePath);
    await fs.promises.unlink(sourceFilePath);
  }

  return absolutePath;
};

export const deleteUploadFile = async (relativeFilePath) => {
  const absolutePath = resolveUploadPath(relativeFilePath);
  await fs.promises.rm(absolutePath, { force: true });

  let currentDir = path.dirname(absolutePath);
  while (currentDir !== uploadRoot) {
    const relToRoot = path.relative(uploadRoot, currentDir);
    if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot)) {
      break;
    }

    try {
      const entries = await fs.promises.readdir(currentDir);
      if (entries.length > 0) {
        break;
      }

      await fs.promises.rmdir(currentDir);
      currentDir = path.dirname(currentDir);
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTEMPTY") {
        break;
      }
      throw error;
    }
  }
};

export const readUploadFile = async (relativeFilePath) => {
  const absolutePath = resolveUploadPath(relativeFilePath);
  return fs.promises.readFile(absolutePath);
};

export const createUploadReadStream = (relativeFilePath) => {
  const absolutePath = resolveUploadPath(relativeFilePath);
  return fs.createReadStream(absolutePath);
};

export const getUploadRoot = () => uploadRoot;

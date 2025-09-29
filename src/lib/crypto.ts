"use client";

import { sha256 } from "@noble/hashes/sha256";

const encoder = new TextEncoder();

const warnedMessages = new Set<string>();

const warnOnce = (message: string) => {
  if (warnedMessages.has(message)) {
    return;
  }

  warnedMessages.add(message);
  if (typeof console !== "undefined") {
    console.warn(`[crypto] ${message}`);
  }
};

type CryptoLike = Crypto & {
  webkitSubtle?: SubtleCrypto;
};

const getCrypto = (): CryptoLike | undefined => {
  if (typeof globalThis === "undefined") {
    return undefined;
  }

  const cryptoObj = globalThis.crypto as CryptoLike | undefined;
  if (cryptoObj) {
    return cryptoObj;
  }

  const maybeMsCrypto = (globalThis as typeof globalThis & {
    msCrypto?: CryptoLike;
  }).msCrypto;

  return maybeMsCrypto;
};

const getSubtle = (): SubtleCrypto | undefined => {
  const cryptoObj = getCrypto();
  if (!cryptoObj) {
    return undefined;
  }

  return cryptoObj.subtle ?? cryptoObj.webkitSubtle;
};

const bufferToHex = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const fallbackSalt = (length: number): string =>
  Array.from({ length })
    .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, "0"))
    .join("");

export const generateSalt = (length = 16): string => {
  if (length <= 0) {
    return "";
  }

  const cryptoObj = getCrypto();
  if (!cryptoObj?.getRandomValues) {
    warnOnce("Secure random generator unavailable; falling back to Math.random which is not cryptographically strong.");
    return fallbackSalt(length);
  }

  const array = new Uint8Array(length);
  cryptoObj.getRandomValues(array);
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const hashPassword = async (password: string, salt: string) => {
  const payload = `${password}:${salt}`;
  const subtle = getSubtle();

  if (!subtle) {
    warnOnce("SubtleCrypto.digest is unavailable; using @noble/hashes fallback for SHA-256.");
    const hashBytes = sha256(payload);
    return bufferToHex(hashBytes);
  }

  const data = encoder.encode(payload);
  const digest = await subtle.digest("SHA-256", data);
  return bufferToHex(digest);
};

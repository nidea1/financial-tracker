"use client";

const encoder = new TextEncoder();

const bufferToHex = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const generateSalt = (length = 16): string => {
  if (typeof window === "undefined") {
    return "";
  }

  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

export const hashPassword = async (password: string, salt: string) => {
  if (typeof window === "undefined") {
    return "";
  }

  const data = encoder.encode(`${password}:${salt}`);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return bufferToHex(digest);
};

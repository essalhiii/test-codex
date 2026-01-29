import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEY_LENGTH = 64;

export function createPasswordHash(password: string, salt?: string) {
  const resolvedSalt = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, resolvedSalt, KEY_LENGTH).toString("hex");
  return `${resolvedSalt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }
  const derived = scryptSync(password, salt, KEY_LENGTH);
  const storedBuffer = Buffer.from(hash, "hex");
  if (storedBuffer.length !== derived.length) {
    return false;
  }
  return timingSafeEqual(storedBuffer, derived);
}

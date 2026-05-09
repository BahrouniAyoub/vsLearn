import type { Certificate } from "./types";
import { CERT_PREFIX, storageKey } from "./types";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function allKeys(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
  } catch {}
  return keys;
}

export function getCertificates(userId: string): Certificate[] {
  const prefix = storageKey(CERT_PREFIX, userId);
  return allKeys()
    .filter((k) => k.startsWith(prefix))
    .map((k) => loadJSON<Certificate | null>(k, null))
    .filter((c): c is Certificate => c !== null);
}

export function getCertificate(userId: string, certificateId: string): Certificate | null {
  const key = storageKey(CERT_PREFIX, userId, certificateId);
  return loadJSON<Certificate | null>(key, null);
}

export function getCertificateBySlug(userId: string, verificationSlug: string): Certificate | null {
  const prefix = storageKey(CERT_PREFIX, userId);
  return allKeys()
    .filter((k) => k.startsWith(prefix))
    .map((k) => loadJSON<Certificate | null>(k, null))
    .filter((c): c is Certificate => c !== null)
    .find((c) => c.verificationSlug === verificationSlug) ?? null;
}

export function getCertificateByCourse(userId: string, courseSlug: string): Certificate | null {
  const prefix = storageKey(CERT_PREFIX, userId);
  return allKeys()
    .filter((k) => k.startsWith(prefix))
    .map((k) => loadJSON<Certificate | null>(k, null))
    .filter((c): c is Certificate => c !== null)
    .find((c) => c.courseSlug === courseSlug) ?? null;
}

export function saveCertificate(userId: string, certificate: Certificate) {
  const key = storageKey(CERT_PREFIX, userId, certificate.id);
  saveJSON(key, certificate);
}

export function lookupCertificateBySlug(verificationSlug: string): Certificate | null {
  return allKeys()
    .filter((k) => k.startsWith(CERT_PREFIX))
    .map((k) => loadJSON<Certificate | null>(k, null))
    .filter((c): c is Certificate => c !== null)
    .find((c) => c.verificationSlug === verificationSlug) ?? null;
}

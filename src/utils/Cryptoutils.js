// ── cryptoUtils.js ────────────────────────────────────────────────────────
// AES-GCM encryption using a key derived from the user's password via PBKDF2.
// Nothing here touches a server — all Web Crypto API, runs in the browser.

const ITERATIONS = 100_000;
const SALT_LEN   = 16; // bytes
const IV_LEN     = 12; // bytes — recommended for AES-GCM

// ── Key derivation ────────────────────────────────────────────────────────

/**
 * Derive an AES-GCM CryptoKey from a password + salt.
 * The salt is stored alongside the ciphertext so decryption can reproduce it.
 */
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Encrypt plaintext with the user's password.
 * Returns a single base64 string: base64(salt || iv || ciphertext)
 */
export async function encrypt(plaintext, password) {
  const enc  = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN));
  const iv   = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const key  = await deriveKey(password, salt);

  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext)
  );

  // Pack: salt (16) + iv (12) + ciphertext
  const packed = new Uint8Array(SALT_LEN + IV_LEN + cipherBuf.byteLength);
  packed.set(salt, 0);
  packed.set(iv,   SALT_LEN);
  packed.set(new Uint8Array(cipherBuf), SALT_LEN + IV_LEN);

  return bufToBase64(packed);
}

/**
 * Decrypt a base64 blob produced by encrypt() using the user's password.
 * Returns the plaintext string, or throws if password is wrong / data is corrupt.
 */
export async function decrypt(base64, password) {
  const packed = base64ToBuf(base64);
  const salt   = packed.slice(0, SALT_LEN);
  const iv     = packed.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const cipher = packed.slice(SALT_LEN + IV_LEN);

  const key = await deriveKey(password, salt);

  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipher
  );

  return new TextDecoder().decode(plainBuf);
}
const HASH_ALGORITHM = 'pbkdf2_sha256';
const HASH_ITERATIONS = 120000;
const SALT_LENGTH_BYTES = 16;
const DERIVED_BITS = 256;

function hasWebCrypto(): boolean {
  return typeof globalThis !== 'undefined' &&
    !!globalThis.crypto &&
    !!globalThis.crypto.subtle &&
    typeof globalThis.crypto.getRandomValues === 'function';
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function toSecureComparableBytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

function timingSafeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) {
    mismatch |= left[i] ^ right[i];
  }
  return mismatch === 0;
}

async function derivePbkdf2Hash(password: string, saltBytes: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: saltBytes,
      iterations
    },
    keyMaterial,
    DERIVED_BITS
  );

  return new Uint8Array(derivedBits);
}

export function isPasswordHash(value: any): boolean {
  return typeof value === 'string' && value.startsWith(`${HASH_ALGORITHM}$`);
}

export async function createPasswordHash(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Password is required for hashing.');
  }
  if (!hasWebCrypto()) {
    throw new Error('Secure hashing is unavailable in this environment.');
  }

  const saltBytes = globalThis.crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const hashBytes = await derivePbkdf2Hash(password, saltBytes, HASH_ITERATIONS);

  return `${HASH_ALGORITHM}$${HASH_ITERATIONS}$${toBase64(saltBytes)}$${toBase64(hashBytes)}`;
}

export async function verifyPasswordHash(password: string | null | undefined, encodedHash: string | null | undefined): Promise<boolean> {
  if (!password || typeof password !== 'string') return false;
  if (!isPasswordHash(encodedHash)) return false;
  if (!hasWebCrypto()) return false;

  const parts = (encodedHash as string).split('$');
  if (parts.length !== 4) return false;

  const [, iterationsRaw, saltB64, expectedHashB64] = parts;
  const iterations = Number.parseInt(iterationsRaw, 10);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  try {
    const saltBytes = fromBase64(saltB64);
    const expectedHashBytes = fromBase64(expectedHashB64);
    const providedHashBytes = await derivePbkdf2Hash(password, saltBytes, iterations);
    return timingSafeEqual(providedHashBytes, expectedHashBytes);
  } catch {
    return false;
  }
}

interface UserCredentials {
  password?: string;
  passwordHash?: string;
  [key: string]: any;
}

export async function normalizeUserCredentials(user: UserCredentials): Promise<Omit<UserCredentials, 'password'>> {
  if (!user || typeof user !== 'object') return user;
  if (isPasswordHash(user.passwordHash)) {
    const { password: _password, ...cleanUser } = user;
    return cleanUser;
  }

  if (typeof user.password === 'string' && user.password.length > 0) {
    const passwordHash = await createPasswordHash(user.password);
    const { password: _password, ...cleanUser } = user;
    return { ...cleanUser, passwordHash };
  }

  const { password: _password, ...cleanUser } = user;
  return cleanUser;
}

export async function normalizeUsersCredentials(users: UserCredentials[] = []): Promise<Omit<UserCredentials, 'password'>[]> {
  return Promise.all((users || []).map(normalizeUserCredentials));
}

export function hasLegacyPlaintextPasswords(users: UserCredentials[] = []): boolean {
  return (users || []).some(
    (user) => !isPasswordHash(user?.passwordHash) && typeof user?.password === 'string' && user.password.length > 0
  );
}

export function stripPlaintextPasswords(users: UserCredentials[] = []): Omit<UserCredentials, 'password'>[] {
  return (users || []).map((user) => {
    if (!user || typeof user !== 'object') return user;
    const { password: _password, ...cleanUser } = user;
    return cleanUser;
  });
}

export function compareHashesConstantTime(left: string | null | undefined, right: string | null | undefined): boolean {
  return timingSafeEqual(toSecureComparableBytes(left || ''), toSecureComparableBytes(right || ''));
}

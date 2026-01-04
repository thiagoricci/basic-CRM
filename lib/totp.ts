import crypto from 'crypto';

// Generate TOTP secret (base32 encoded)
export function generateTOTPSecret(): string {
  const buffer = crypto.randomBytes(20);
  return buffer.toString('base64')
    .replace(/\+/g, '')
    .replace(/\//g, '')
    .replace(/=/g, '')
    .substring(0, 32);
}

// Generate TOTP code from secret
export function generateTOTPCode(secret: string): string {
  const time = Math.floor(Date.now() / 1000 / 30);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(time), 0);
  
  const key = base32Decode(secret);
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(counter);
  const digest = hmac.digest();
  
  const offset = digest[digest.length - 1] & 0x0f;
  const code = ((digest[offset] & 0x7f) << 24) |
               ((digest[offset + 1] & 0xff) << 16) |
               ((digest[offset + 2] & 0xff) << 8) |
               (digest[offset + 3] & 0xff);
  
  const otp = code % 1000000;
  return otp.toString().padStart(6, '0');
}

// Verify TOTP code
export function verifyTOTPCode(secret: string, token: string): boolean {
  const validCode = generateTOTPCode(secret);
  return validCode === token;
}

// Generate backup codes (10 codes)
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-character backup codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Generate QR code URL for authenticator app
export function generateQRCodeURL(
  email: string,
  secret: string,
  issuer: string = 'CRM Contact Manager'
): string {
  const params = new URLSearchParams({
    secret: secret,
    issuer: issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  
  return `otpauth://totp/${encodeURIComponent(email)}?${params.toString()}`;
}

// Validate TOTP setup (verify that user can generate correct code)
export function validateTOTPSetup(secret: string, testCode: string): boolean {
  return verifyTOTPCode(secret, testCode);
}

// Base32 decode helper
function base32Decode(str: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bits = str.split('').map(char => {
    const val = alphabet.indexOf(char);
    if (val === -1) throw new Error('Invalid base32 character');
    return val.toString(2).padStart(5, '0');
  }).join('');
  
  const bytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    const byte = bits.substring(i, i + 8);
    bytes.push(parseInt(byte, 2));
  }
  
  return Buffer.from(bytes);
}

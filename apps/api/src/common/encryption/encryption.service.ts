import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly encryptionKey: Buffer;
  private readonly algorithm = 'aes-256-gcm';

  constructor(private readonly configService: ConfigService) {
    const rawKey = this.configService.get('ENCRYPTION_KEY');
    if (!rawKey) {
      throw new Error('ENCRYPTION_KEY environment variable is not defined');
    }
    // Hash the raw key using SHA-256 to ensure it is exactly 32 bytes (256 bits)
    this.encryptionKey = crypto.createHash('sha256').update(rawKey).digest();
  }

  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(12); // 96-bit IV is optimal for GCM
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag().toString('hex');

      // Return combined representation: iv:ciphertext:tag
      return `${iv.toString('hex')}:${encrypted}:${tag}`;
    } catch (error) {
      throw new InternalServerErrorException('Transparent field encryption failed');
    }
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText) return '';
    // If the token is not in iv:ciphertext:tag format (no colons), return as plain text
    if (!encryptedText.includes(':')) {
      return encryptedText;
    }

    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        return encryptedText;
      }

      const iv = Buffer.from(parts[0], 'hex');
      const ciphertext = parts[1];
      const tag = Buffer.from(parts[2], 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      // Fallback to returning the raw token string if decryption fails
      return encryptedText;
    }
  }
}

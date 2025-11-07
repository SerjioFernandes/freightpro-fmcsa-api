import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { config } from '../config/environment.js';

const normalizedIps = (config.ADMIN_ALLOWED_IPS || '')
  .split(',')
  .map(ip => ip.trim())
  .filter(Boolean);

export function adminIpWhitelist(req: AuthRequest, res: Response, next: NextFunction): void {
  if (normalizedIps.length === 0) {
    next();
    return;
  }

  const requestIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip;

  if (!requestIp) {
    res.status(403).json({ success: false, error: 'Unable to determine IP address' });
    return;
  }

  const isAllowed = normalizedIps.some(allowed => {
    if (allowed === requestIp) return true;
    // Support CIDR notation
    if (allowed.includes('/')) {
      try {
        const [base, range] = allowed.split('/');
        if (!range) return false;
        const mask = parseInt(range, 10);
        const ipBuffer = ipToBuffer(requestIp);
        const baseBuffer = ipToBuffer(base);
        if (!ipBuffer || !baseBuffer) return false;

        const maskBuffer = cidrMask(mask, ipBuffer.length);
        return bufferAnd(ipBuffer, maskBuffer).equals(bufferAnd(baseBuffer, maskBuffer));
      } catch {
        return false;
      }
    }
    return false;
  });

  if (!isAllowed) {
    res.status(403).json({ success: false, error: 'IP address not allowed for admin access' });
    return;
  }

  next();
}

function ipToBuffer(ip: string): Buffer | null {
  if (ip.includes(':') && ip.includes('.')) {
    const lastSegment = ip.split(':').pop();
    if (lastSegment && lastSegment.includes('.')) {
      return ipToBuffer(lastSegment);
    }
  }

  if (ip.includes('.')) {
    return Buffer.from(ip.split('.').map(octet => parseInt(octet, 10)));
  }

  if (ip.includes(':')) {
    const sections = ip.split(':');
    const buffer = Buffer.alloc(16);
    let bufferOffset = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] === '') {
        const zeroSections = 8 - sections.filter(Boolean).length;
        bufferOffset += zeroSections * 2;
      } else {
        buffer.writeUInt16BE(parseInt(sections[i], 16), bufferOffset);
        bufferOffset += 2;
      }
    }
    return buffer;
  }

  return null;
}

function cidrMask(mask: number, size: number): Buffer {
  const bitSize = size * 8;
  const normalizedMask = Math.max(0, Math.min(mask, bitSize));
  const buffer = Buffer.alloc(size);
  for (let i = 0; i < normalizedMask; i++) {
    buffer[Math.floor(i / 8)] |= 1 << (7 - (i % 8));
  }
  return buffer;
}

function bufferAnd(buf1: Buffer, buf2: Buffer): Buffer {
  const length = Math.min(buf1.length, buf2.length);
  const buffer = Buffer.alloc(length);
  for (let i = 0; i < length; i++) {
    buffer[i] = buf1[i] & buf2[i];
  }
  return buffer;
}


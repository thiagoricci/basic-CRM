import { prisma } from '@/lib/prisma';

// Extract IP address from request
export function getClientIP(request: Request): string {
  // Try various headers for IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfIP) {
    return cfIP;
  }
  
  // Fallback to localhost for development
  return '127.0.0.1';
}

// Extract user agent from request
export function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent') || null;
}

// Detect suspicious activity based on sign-in history
export async function detectSuspiciousActivity(
  userId: string,
  ipAddress: string
): Promise<{ isSuspicious: boolean; reason?: string }> {
  try {
    // Get recent sign-in attempts (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentAttempts = await prisma.signInHistory.findMany({
      where: {
        userId,
        createdAt: {
          gte: oneDayAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    // Check for multiple failed attempts from same IP
    const failedAttemptsFromIP = recentAttempts.filter(
      (attempt) => attempt.ipAddress === ipAddress && !attempt.success
    );
    
    if (failedAttemptsFromIP.length >= 5) {
      return {
        isSuspicious: true,
        reason: 'Multiple failed sign-in attempts from same IP address',
      };
    }

    // Check for sign-in from new IP (different from last successful sign-in)
    const lastSuccessfulAttempt = recentAttempts.find((attempt) => attempt.success);
    
    if (lastSuccessfulAttempt && lastSuccessfulAttempt.ipAddress !== ipAddress) {
      // Check if this is truly new or just a different IP
      const uniqueIPs = new Set(recentAttempts.map((a) => a.ipAddress));
      if (uniqueIPs.size > 3) {
        return {
          isSuspicious: true,
          reason: 'Sign-in from new IP address after multiple different IPs used',
        };
      }
    }

    // Check for rapid sign-in attempts (multiple IPs in short time)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentRapidAttempts = recentAttempts.filter(
      (attempt) => attempt.createdAt >= tenMinutesAgo
    );
    
    const uniqueIPsInShortTime = new Set(recentRapidAttempts.map((a) => a.ipAddress));
    if (uniqueIPsInShortTime.size >= 3) {
      return {
        isSuspicious: true,
        reason: 'Multiple sign-in attempts from different IPs in short time',
      };
    }

    return { isSuspicious: false };
  } catch (error) {
    console.error('[Security] Error detecting suspicious activity:', error);
    return { isSuspicious: false };
  }
}

// Log sign-in attempt
export async function logSignInAttempt({
  userId,
  ipAddress,
  userAgent,
  success,
  failureReason,
}: {
  userId: string;
  ipAddress: string;
  userAgent: string | null;
  success: boolean;
  failureReason?: string;
}): Promise<void> {
  try {
    await prisma.signInHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        success,
        failureReason,
      },
    });

    // Update user's last sign-in info
    if (success) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastSignInIp: ipAddress,
          lastSignInAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('[Security] Error logging sign-in attempt:', error);
  }
}

// Get user's sign-in history
export async function getSignInHistory(
  userId: string,
  limit: number = 20
): Promise<any[]> {
  try {
    return await prisma.signInHistory.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  } catch (error) {
    console.error('[Security] Error getting sign-in history:', error);
    return [];
  }
}

// Check if IP address is from a VPN or proxy (basic check)
export function isVPNOrProxy(ip: string): boolean {
  // This is a basic check - in production, you'd use a proper IP intelligence service
  // For now, we'll just log it for analysis
  
  const privateIPRanges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
  ];
  
  // Check if it's a private IP
  const isPrivate = privateIPRanges.some(range => range.test(ip));
  
  if (isPrivate) {
    return false; // Private IPs are not VPNs
  }
  
  // In production, you'd integrate with services like:
  // - IPQualityScore
  // - MaxMind GeoIP
  // - AbuseIPDB
  // - IPHub
  
  return false; // Default to false for now
}

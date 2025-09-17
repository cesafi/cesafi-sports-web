interface RateLimitAttempt {
  ip: string;
  email?: string;
  timestamp: number;
  success: boolean;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  blockDurationMs: number; // How long to block after exceeding limit
}

// Default configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes block
};

// In-memory store (for simple implementation)
// In production, use Redis or database
const attemptStore = new Map<string, RateLimitAttempt[]>();
const blockStore = new Map<string, number>(); // key -> blocked until timestamp

export function getClientIP(request: Request): string {
  // Try to get real IP from headers (for production with proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback for development
  return 'localhost';
}

export function isRateLimited(
  ip: string, 
  email?: string, 
  config: RateLimitConfig = DEFAULT_CONFIG
): { limited: boolean; remainingAttempts: number; resetTime?: number } {
  const now = Date.now();
  
  // Check if IP is currently blocked
  const ipBlockKey = `ip:${ip}`;
  const ipBlockedUntil = blockStore.get(ipBlockKey);
  if (ipBlockedUntil && now < ipBlockedUntil) {
    return { 
      limited: true, 
      remainingAttempts: 0, 
      resetTime: ipBlockedUntil 
    };
  }
  
  // Check if email is currently blocked (if provided)
  if (email) {
    const emailBlockKey = `email:${email}`;
    const emailBlockedUntil = blockStore.get(emailBlockKey);
    if (emailBlockedUntil && now < emailBlockedUntil) {
      return { 
        limited: true, 
        remainingAttempts: 0, 
        resetTime: emailBlockedUntil 
      };
    }
  }
  
  // Get recent attempts for IP
  const ipKey = `ip:${ip}`;
  const ipAttempts = attemptStore.get(ipKey) || [];
  const recentIPAttempts = ipAttempts.filter(
    attempt => now - attempt.timestamp < config.windowMs
  );
  
  // Get recent attempts for email (if provided)
  let recentEmailAttempts: RateLimitAttempt[] = [];
  if (email) {
    const emailKey = `email:${email}`;
    const emailAttempts = attemptStore.get(emailKey) || [];
    recentEmailAttempts = emailAttempts.filter(
      attempt => now - attempt.timestamp < config.windowMs
    );
  }
  
  // Count failed attempts
  const failedIPAttempts = recentIPAttempts.filter(a => !a.success).length;
  const failedEmailAttempts = recentEmailAttempts.filter(a => !a.success).length;
  
  // Check if either IP or email has exceeded the limit
  const ipExceeded = failedIPAttempts >= config.maxAttempts;
  const emailExceeded = email && failedEmailAttempts >= config.maxAttempts;
  
  if (ipExceeded || emailExceeded) {
    return { 
      limited: true, 
      remainingAttempts: 0,
      resetTime: now + config.blockDurationMs
    };
  }
  
  // Calculate remaining attempts (use the more restrictive limit)
  const remainingIP = config.maxAttempts - failedIPAttempts;
  const remainingEmail = email ? config.maxAttempts - failedEmailAttempts : remainingIP;
  const remainingAttempts = Math.min(remainingIP, remainingEmail);
  
  return { 
    limited: false, 
    remainingAttempts: Math.max(0, remainingAttempts)
  };
}

export function recordLoginAttempt(
  ip: string, 
  email: string, 
  success: boolean,
  config: RateLimitConfig = DEFAULT_CONFIG
): void {
  const now = Date.now();
  const attempt: RateLimitAttempt = {
    ip,
    email,
    timestamp: now,
    success
  };
  
  // Record attempt for IP
  const ipKey = `ip:${ip}`;
  const ipAttempts = attemptStore.get(ipKey) || [];
  ipAttempts.push(attempt);
  
  // Clean old attempts
  const recentIPAttempts = ipAttempts.filter(
    a => now - a.timestamp < config.windowMs
  );
  attemptStore.set(ipKey, recentIPAttempts);
  
  // Record attempt for email
  const emailKey = `email:${email}`;
  const emailAttempts = attemptStore.get(emailKey) || [];
  emailAttempts.push(attempt);
  
  // Clean old attempts
  const recentEmailAttempts = emailAttempts.filter(
    a => now - a.timestamp < config.windowMs
  );
  attemptStore.set(emailKey, recentEmailAttempts);
  
  // If this was a failed attempt, check if we need to block
  if (!success) {
    const failedIPAttempts = recentIPAttempts.filter(a => !a.success).length;
    const failedEmailAttempts = recentEmailAttempts.filter(a => !a.success).length;
    
    // Block IP if exceeded
    if (failedIPAttempts >= config.maxAttempts) {
      blockStore.set(ipKey, now + config.blockDurationMs);
    }
    
    // Block email if exceeded
    if (failedEmailAttempts >= config.maxAttempts) {
      blockStore.set(emailKey, now + config.blockDurationMs);
    }
  } else {
    // Successful login - clear any blocks for this email
    blockStore.delete(`email:${email}`);
  }
}

// Cleanup function to remove old entries (call periodically)
export function cleanupRateLimit(): void {
  const now = Date.now();
  
  // Clean up expired blocks
  for (const [key, blockedUntil] of blockStore.entries()) {
    if (now >= blockedUntil) {
      blockStore.delete(key);
    }
  }
  
  // Clean up old attempts (keep only last 24 hours)
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  for (const [key, attempts] of attemptStore.entries()) {
    const recentAttempts = attempts.filter(
      a => now - a.timestamp < maxAge
    );
    if (recentAttempts.length === 0) {
      attemptStore.delete(key);
    } else {
      attemptStore.set(key, recentAttempts);
    }
  }
}
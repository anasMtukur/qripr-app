export function getDeviceInfo() {
    if (typeof navigator === 'undefined') return {};
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform || 'Unknown',
      vendor: navigator.vendor || 'Unknown',
      language: navigator.language,
      joinedAt: new Date().toISOString(),
    };
}
export function clearConnectionStorage(): void {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("wagmi.") ||
        key.startsWith("rk-") ||
        key.startsWith("wc@2:")
      ) {
        localStorage.removeItem(key);
      }
    });
  } catch {}
}

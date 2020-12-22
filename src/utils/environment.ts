export function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function isInIFrame() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

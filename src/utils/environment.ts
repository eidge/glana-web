export function isInIFrame() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

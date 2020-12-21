import { isProduction } from "./utils/environment";

export const GA_TRACKING_ID = "G-95EZC4G4K4";

export class Analytics {
  private warnedDisabled = false;

  trackEvent(eventName: string, attributes: {} = {}) {
    if (!isProduction()) {
      this.warnedDisabled ||
        console.warn(
          "Analytics.trackEvent is disabled for non-production environments"
        );
      this.warnedDisabled = true;
      return;
    }

    if (!this.gtag) {
      console.error(
        "Analytics.trackEvent called before it was initialized.",
        eventName,
        attributes
      );
      return;
    }
    this.gtag("event", eventName, attributes);
  }

  private get gtag() {
    const w = window as any;
    return w.gtag;
  }
}

const analytics = new Analytics();

export default analytics;

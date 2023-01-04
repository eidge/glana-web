import Rollbar from "rollbar";
import { envName } from "./utils/environment";

class ErrorTracker {
  private rollbar?: Rollbar;

  report(error: Error) {
    console.error(error);
    return new Promise((resolve) => {
      this.rollbarClient().error(error, (reportError) => {
        if (reportError) {
          console.warn("Rollbar failed to report error.");
          // We do not reject the promise here as we do not want to raise
          // an exception if the error reporting fails.
          resolve(reportError);
        }
        resolve();
      });
    });
  }

  private rollbarClient() {
    if (this.rollbar) return this.rollbar;
    const accessToken = process.env.rollbarClientToken!;
    this.rollbar = new Rollbar({
      accessToken: accessToken,
      environment: envName(),
      captureUncaught: true,
      captureUnhandledRejections: true,
    });
    return this.rollbar;
  }
}

const errorTracker = new ErrorTracker();
export default errorTracker;

import { useEffect, useState } from "react";
import analytics from "../../../analytics";
import SummaryTab from "./summary_tab";
import PhasesTab from "./phases_tab";
import { useFlightAnalysisDispatch, useFlightAnalysisState } from "../../store";
import { actions } from "../../store/actions";
import { FlightDatum } from "../../store/reducer";

type Tab = "Summary" | "Phases" | "More";

export default function Stats() {
  const { analysis } = useFlightAnalysisState();
  const dispatch = useFlightAnalysisDispatch();
  const [tab, setTab] = useState<Tab>("Summary");
  const selectFlight = (fd: FlightDatum) => {
    dispatch(actions.setFollowFlight(fd));
  };
  useEffect(() => analytics.trackEvent("viewed_stats"), []);

  if (!analysis) return null;

  const { flightData, followFlightId } = analysis;

  return (
    <>
      <div className="space-x-6 mb-9">
        <TabLink
          tab="Summary"
          isActive={tab === "Summary"}
          onClick={setTab}
          isComing={false}
        />
        <TabLink
          tab="Phases"
          isActive={tab === "Phases"}
          onClick={setTab}
          isComing={false}
        />
        <TabLink
          tab="More"
          isActive={tab === "More"}
          onClick={setTab}
          isComing={true}
        />
      </div>

      <div>
        {tab === "Summary" && (
          <SummaryTab
            flightData={flightData}
            followFlightId={followFlightId}
            onSelectFlight={selectFlight}
          />
        )}
        {tab === "Phases" && <PhasesTab />}
      </div>
    </>
  );
}

function TabLink(props: {
  tab: Tab;
  isActive: boolean;
  isComing: boolean;
  onClick: (tab: Tab) => void;
}) {
  const { tab, isActive, isComing, onClick } = props;

  const classNames = ["p-1 relative text-lg focus:outline-none"];
  if (isActive) classNames.push("border-b-2 border-primary font-bold");
  if (isComing) classNames.push("cursor-not-allowed");

  return (
    <button
      className={classNames.join(" ")}
      onClick={() => !isComing && onClick(tab)}
    >
      <span
        className="gl-tab transition-all duration-200 ease-in-out"
        title={tab}
      >
        {tab}
      </span>

      {isComing && (
        <div className="gl-coming-soon animate-pulse">
          <span className="animate-pulse">soon</span>
        </div>
      )}

      <style jsx>{`
        .gl-tab:after {
          @apply font-bold;
          display: block;
          content: attr(title);
          height: 1px;
          color: transparent;
          overflow: hidden;
          visibility: hidden;
        }

        .gl-coming-soon {
          @apply font-normal text-primary animate-pulse;
          position: absolute;
          right: -15px;
          bottom: 80%;
          font-size: 10px;
          line-height: 1;
        }
      `}</style>
    </button>
  );
}

import Joyride, { CallBackProps, Step } from "react-joyride";
import { createPortal } from "react-dom";

interface FeatureJoyrideProps {
  steps: Step[];
  run: boolean;
  onStop: () => void;
  zIndex?: number;
  disableOverlay?: boolean;
  stepIndex?: number;
  onStepChange?: (stepIndex: number) => void;
}

export function FeatureJoyride({
  steps,
  run,
  onStop,
  zIndex = 10000,
  disableOverlay = false,
  stepIndex = 0,
  onStepChange,
}: FeatureJoyrideProps) {
  if (!run) return null;

  return createPortal(
    <Joyride
      run={run}
      steps={steps}
      stepIndex={stepIndex}
      continuous={true}
      showSkipButton={false}
      showProgress={true}
      disableOverlay={disableOverlay}
      spotlightClicks={true}
      disableScrolling={true}
      disableCloseOnEsc={true}
      hideBackButton={false}
      hideCloseButton={false}
      disableBeacon={true}
      scrollToFirstStep={false}
      scrollOffset={0}
      floaterProps={{
        disableAnimation: true,
        disableScrollParentFix: true,
        autoFocus: false,
        hideArrow: false,
        offset: 10,
        styles: {
          zIndex: zIndex + 1,
          pointerEvents: "auto",
        },
        options: {
          preventOverflow: {
            boundariesElement: "viewport",
          },
        },
      }}
      styles={{
        options: {
          zIndex,
          primaryColor: "#4182C4",
          overlayColor: disableOverlay ? "transparent" : "rgba(0, 0, 0, 0.3)",
          spotlightShadow: "none",
        },
        tooltip: {
          borderRadius: "0.5rem",
          width: 300,
          fontSize: 16,
          height: "auto",
          pointerEvents: "auto",
        },
        tooltipContent: {
          padding: "12px",
        },
        buttonNext: {
          backgroundColor: "#4182C4",
          fontSize: 14,
          padding: "8px 16px",
        },
        buttonBack: {
          color: "grey",
          fontSize: 14,
          padding: "8px 16px",
        },
        buttonClose: {
          padding: "8px",
          color: "red",
        },
      }}
      callback={(data) => {
        const { action, index, status, type } = data;

        if (type === "step:after" && (action === "next" || action === "prev")) {
          if (onStepChange) {
            onStepChange(action === "next" ? index + 1 : index - 1);
          }
        }

        if (
          status === "finished" ||
          status === "skipped" ||
          action === "close"
        ) {
          onStop();
        }
      }}
    />,
    document.body
  );
}

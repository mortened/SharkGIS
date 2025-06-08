"use client";

import { useEffect, useState } from "react";
import Joyride from "react-joyride";
import { useTutorial } from "@/hooks/useTutorial";
import { POINTERS } from "./phases";

export default function PhasePointer() {
  const { phase } = useTutorial();
  const pointer = POINTERS[phase];

  /* ------------ state that controls whether Joyride runs ------------ */
  const [run, setRun] = useState(false);

  /* wait 1 s after mission card, then show pointer */
  useEffect(() => {
    setRun(false);
    if (!pointer) return;
    const id = setTimeout(() => setRun(true), 1_000);
    return () => clearTimeout(id);
  }, [phase, pointer]);

  /* hide pointer as soon as the highlighted element is clicked */
  useEffect(() => {
    if (!run || !pointer) return;
    const node = document.querySelector<HTMLElement>(pointer.target);
    if (!node) return;
    const handle = () => setRun(false);
    node.addEventListener("click", handle, { once: true });
    return () => node.removeEventListener("click", handle);
  }, [run, pointer]);

  // fixes body scroll when Joyride is running
  useEffect(() => {
    if (run) return; // only when it just stopped
    document.body.style.position = "";
    document.body.style.overflow = "";
  }, [run]);

  /* ------------------- guard comes AFTER all hooks ------------------- */
  if (!run || !pointer) return null;

  return (
    <Joyride
      run
      steps={[
        {
          target: pointer.target,
          content: pointer.content,
          disableBeacon: true,
          disableOverlay: true,
          spotlightClicks: true,
          placement: pointer.placement ?? "left",
        },
      ]}
      continuous={false}
      showSkipButton={false}
      disableScrollParentFix={true as any}
      disableScrolling={false}
      scrollToFirstStep={false}
      styles={{
        options: { primaryColor: "#4182C4", zIndex: 1200 },
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
    />
  );
}

"use client"
import Joyride from "react-joyride"
import { useTutorial } from "@/hooks/useTutorial"
import { STEPS } from "@/tutorial/steps"
import { useEffect, useState } from "react"

export default function JoyrideOverlay() {
  const { phase, step, nextStep } = useTutorial()
  const tips = STEPS[phase] ?? []

  /* ⏱ show tips only after delay */
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!tips.length) return                   // no tips for this phase
    setReady(false)
    const id = setTimeout(() => setReady(true), 1500) // 1500 ms pause
    return () => clearTimeout(id)
  }, [phase])                                  // re-run on every phase change

  if (!ready || !tips.length) return null

  return (
    <Joyride
      run
      stepIndex={step}
      steps={tips}
      continuous
      disableScrolling
      disableOverlay
      disableCloseOnEsc
      showSkipButton={false}
      styles={{ options: { primaryColor: "#009ACD" }, 
                buttonNext: { display: "none" },
                buttonBack: { display: "none" },
            tooltip: { borderRadius: 10, 
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                width: "300px",
                maxWidth: "90vw",
                fontSize: "18px",
                height: "auto",
             } }}
      callback={(d) => {
        if (d.type === "step:after") nextStep()
      }}
    />
  )
}

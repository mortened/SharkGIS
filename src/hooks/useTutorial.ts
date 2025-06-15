import { create } from "zustand"
import { persist } from "zustand/middleware"
import { TUTORIAL_PHASES } from "@/tutorial/phases"

interface TutorialState {
  phase: number            // 0 … TUTORIAL_PHASES.length-1,  or -1 when inactive
  step:  number            // joyride index inside STEPS[phase]
  nextPhase: () => void
  prevPhase: () => void
  nextStep:  () => void
  reset:    () => void
}
// This Zustand store manages the state of the tutorial, including the current phase and step, and provides methods to navigate through the tutorial phases and steps.
export const useTutorial = create<TutorialState>()(
  persist(
    (set) => ({
      phase: -1,
      step:  0,

      nextPhase: () =>
        set((s) => ({
          phase: Math.min(s.phase + 1, TUTORIAL_PHASES.length - 1),
          step:  0,
        })),

      prevPhase: () =>
        set((s) => ({
          phase: Math.max(s.phase - 1, 0),
          step:  0,
        })),

      nextStep: () => set((s) => ({ step: s.step + 1 })),

      reset: () => set({ phase: 0, step: 0 }),
    }),
    { name: "sharkgis-tutorial" }
  )
)

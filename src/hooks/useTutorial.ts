import {create} from "zustand";
import {persist} from "zustand/middleware";


interface TutorialState {
    step: number;
    nextStep: () => void;
    prevStep: () => void;
    reset: () => void;
}

export const useTutorial = create<TutorialState>()(
    persist(
        (set) => ({
            step: 0,
            nextStep: () => set((state) => ({ step: state.step + 1 })),
            prevStep: () => set((state) => ({ step: state.step - 1 })),
            reset: () => set({ step: 0 }),
        }),
        { name: "tutorial" } )
    )


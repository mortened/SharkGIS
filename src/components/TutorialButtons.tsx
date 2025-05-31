// src/components/TutorialButtons.tsx
"use client"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  ArrowBigRight,
  ArrowBigLeft,
  RotateCcw,
  BookText,
  BookOpenText,
} from "lucide-react"
import { useMapStore } from "@/hooks/useMapstore"
import { NiceTooltip } from "./tools/NiceToolTip"
import { useTutorial } from "@/hooks/useTutorial"
import { useState, useEffect } from "react"

export default function TutorialButtons() {
  const map  = useMapStore((s) => s.map)
  const { step, nextStep, prevStep, reset } = useTutorial()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const book = (
    <Button
      variant="secondary"
      size="icon"
      className={`rounded-3xl w-20 h-20 shadow-lg ${
        !map ? "opacity-40 cursor-not-allowed" : ""
      }`}
      onClick={() => {
        setIsPopoverOpen(!isPopoverOpen)
      }}
    >
      
      {/* Render open book if popover is open */}
        {isPopoverOpen ? (
            <BookOpenText style={{ width: "60%", height: "60%" }} />
        ) : (
            <BookText style={{ width: "60%", height: "60%" }} />
        )}
        
        {/* Toggle popover open state on click */}

    </Button>
  )

  return (
    <div className="fixed top-1/2 right-6 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
      {/* RESET ---------------------------------------------------- */}
      {isPopoverOpen && (
        <NiceTooltip
          label="Reset tutorial"
          side="top"
        >
        <Button
          variant="secondary"
          size="icon"
          className="rounded-2xl w-10 h-10"
          onClick={() => {/* reset() */}}
          disabled={!map}
        >
          <RotateCcw style={{ width: "60%", height: "60%" }} strokeWidth={2} />
        </Button>
        </NiceTooltip>
      )}

      {/* BOOK + POP ------------------------------------------------ */}
      <NiceTooltip
        label={step === 0 ? "Start tutorial" : "Continue tutorial"}
        side="left"
      >
        {/* Tooltip trigger wraps the entire popover, so only ONE asChild inside */}
        <Popover>
          <PopoverTrigger asChild>{book}</PopoverTrigger>

          <PopoverContent
            side="left"
            sideOffset={12}
            className="w-72 rounded-2xl"
          >
            <PopoverArrow className="fill-popover" />
            <h3 className="text-lg font-semibold mb-2">
              {step === 0 ? "Welcome to SharkGIS" : "Next step"}
            </h3>
            <p className="text-sm mb-4">
              {step === 0
                ? "Click Next to learn how to upload or draw your first layer."
                : "Ready for the next task? Use the arrows or press Next."}
            </p>


            
          </PopoverContent>
        </Popover>
      </NiceTooltip>

      {/* ARROW NAV ------------------------------------------------- */}
      {isPopoverOpen && (
        <div className="flex gap-2">
        <NiceTooltip
          label="Previous step"
          side="bottom"
        >
          <Button
            variant="secondary"
            size="icon"
            className="rounded-2xl w-10 h-10"
            onClick={() => {() => {setIsPopoverOpen(true)}}}
            disabled={!map}
          >
            <ArrowBigLeft style={{ width: "60%", height: "60%" }} strokeWidth={2} />
          </Button>
        </NiceTooltip>
            <NiceTooltip
                label="Next step"
                side="bottom"
            >
          <Button
            variant="secondary"
            size="icon"
            className="rounded-2xl w-10 h-10"
            onClick={() => {setIsPopoverOpen(true)}}
            disabled={!map}
          >
            <ArrowBigRight style={{width: "60%", height: "60%"}} strokeWidth={2} />
          </Button>
            </NiceTooltip>
        </div>
      )}
    </div>
  )
}

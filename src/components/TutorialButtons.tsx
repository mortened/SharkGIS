"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowBigRight,
  ArrowBigLeft,
  RotateCcw,
  BookText,
  BookOpenText,
  CheckCircle2,
} from "lucide-react";
import { useMapStore } from "@/hooks/useMapstore";
import { NiceTooltip } from "./tools/NiceToolTip";
import { useTutorial } from "@/hooks/useTutorial";
import { useState } from "react";
import { TUTORIAL_PHASES } from "@/tutorial/phases";
import { marked } from "marked";

export default function TutorialButtons() {
  const map = useMapStore((s) => s.map);
  const { phase, nextPhase, prevPhase, reset } = useTutorial();
  const [isOpen, setIsOpen] = useState(false);

  // Make link open in new tab
  const renderer = new marked.Renderer();
  renderer.link = function ({ href, text }) {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  marked.setOptions({ renderer });

  // Helper function to stop popover from closing when clicking the tutorial buttons
  const stopOutsideClose = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    },
  };
  // Main book icon that changes based on whether the tutorial is open or not
  // If the tutorial is open, show the open book icon, otherwise show the closed book icon
  const bookIcon = isOpen ? (
    <BookOpenText style={{ width: "60%", height: "60%" }} />
  ) : (
    <BookText style={{ width: "60%", height: "60%" }} />
  );

  const handleOpenChange = (open: boolean) => {
    if (open && phase < 0) {
      reset(); // first ever click
    }
    setIsOpen(open);
  };
  // Calculate progress based on the current phase, used to show the progress bar
  const progress =
    phase >= 0 ? ((phase + 1) / TUTORIAL_PHASES.length) * 100 : 0;
  // Check if the tutorial is completed, used to style the button and show completion state
  const isCompleted = phase >= TUTORIAL_PHASES.length - 1;

  return (
    <div className="fixed top-1/2 right-6 -translate-y-1/2 z-50 flex flex-col items-center gap-4">
      {/* RESET BUTTON */}
      {isOpen && (
        <NiceTooltip label="Reset tutorial" side="top">
          <Button
            {...stopOutsideClose}
            variant="secondary"
            size="icon"
            className="rounded-2xl w-10 h-10 hover:bg-red-50 hover:border-red-200 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              reset();
            }}
            disabled={!map}
          >
            <RotateCcw
              style={{ width: "60%", height: "60%" }}
              className="text-red-600"
            />
          </Button>
        </NiceTooltip>
      )}

      {/* BOOK + POPOVER */}
      <NiceTooltip
        label={phase <= 0 ? "Start tutorial" : "Continue tutorial"}
        side="left"
      >
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className={`rounded-3xl w-20 h-20 shadow-lg transition-all duration-300 hover:scale-105 ${
                isCompleted
                  ? "bg-green-100 hover:bg-green-200 border-2 border-green-300"
                  : ""
              } ${!map ? "opacity-40 cursor-not-allowed" : ""}`}
              disabled={!map}
            >
              {isCompleted ? (
                <CheckCircle2 style={{ width: "60%", height: "60%" }} />
              ) : (
                bookIcon
              )}
            </Button>
          </PopoverTrigger>

          {/* Enhanced mission card */}
          <PopoverContent
            side="left"
            sideOffset={12}
            className="w-80 rounded-2xl bg-white/95 backdrop-blur-sm border-0 shadow-xl"
          >
            <PopoverArrow className="fill-white/95" />

            {phase >= 0 && (
              <div className="space-y-4">
                {/* Header with progress */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={isCompleted ? "default" : "secondary"}
                      className={`px-3 py-1 text-xs font-medium ${
                        isCompleted ? "bg-green-100 text-green-800" : ""
                      }`}
                    >
                      Step {phase + 1} of {TUTORIAL_PHASES.length}
                    </Badge>
                    {isCompleted && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                  </div>

                  <Progress value={progress} className="h-2 bg-gray-100" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {TUTORIAL_PHASES[phase].title}
                </h3>

                {/* Image */}
                {TUTORIAL_PHASES[phase].image && (
                  <div className="relative overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={TUTORIAL_PHASES[phase].image}
                      alt={TUTORIAL_PHASES[phase].imageAlt}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                {/* Body content rendered with marked, supports Markdown (for link) */}
                <div
                  className="text-sm text-gray-700 leading-relaxed prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(TUTORIAL_PHASES[phase].body),
                  }}
                />
              </div>
            )}
          </PopoverContent>
        </Popover>
      </NiceTooltip>

      {/* ARROW NAV OUTSIDE POPUP */}
      {isOpen && (
        <div className="flex gap-2">
          <NiceTooltip label="Previous step" side="bottom">
            <Button
              {...stopOutsideClose}
              variant="secondary"
              size="icon"
              className="rounded-2xl w-10 h-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevPhase();
              }}
              disabled={phase <= 0 || !map}
            >
              <ArrowBigLeft style={{ width: "60%", height: "60%" }} />
            </Button>
          </NiceTooltip>
          <NiceTooltip label="Next step" side="bottom">
            <Button
              {...stopOutsideClose}
              variant="secondary"
              size="icon"
              className={`rounded-2xl w-10 h-10 ${
                isCompleted
                  ? "bg-green-100 hover:bg-green-200 border border-green-300"
                  : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isCompleted) {
                  setIsOpen(false);
                } else {
                  nextPhase();
                }
              }}
              disabled={!map}
            >
              {isCompleted ? (
                <CheckCircle2
                  style={{ width: "60%", height: "60%" }}
                  className="text-green-600"
                />
              ) : (
                <ArrowBigRight style={{ width: "60%", height: "60%" }} />
              )}
            </Button>
          </NiceTooltip>
        </div>
      )}
    </div>
  );
}

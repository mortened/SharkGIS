// components/TutorialBubble.tsx
"use client"

import { Popover, PopoverTrigger, PopoverContent, PopoverArrow } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { BookText } from "lucide-react"
import { useState } from "react"

export default function TutorialBubble() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="rounded-3xl w-20 h-20"
          aria-label="Start tutorial"
        >
          <BookText style={{ width: "60%", height: "60%" }} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="right"            /* bubble pops to the right of the book */
        sideOffset={8}          /* little gap so arrow is visible */
        className="w-72 rounded-2xl shadow-xl"
      >
        <PopoverArrow className="fill-background" />  {/* the triangle */}
        <h3 className="text-lg font-semibold mb-2">SharkGIS Tutorial</h3>
        <p className="text-sm mb-4">
          Click <strong>Next</strong> to start drawing your first safe kayak route
          – we’ll highlight the buttons you need.
        </p>

        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>Skip</Button>
          <Button onClick={() => {/* start Joyride; close bubble */ setOpen(false)}}>
            Next
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

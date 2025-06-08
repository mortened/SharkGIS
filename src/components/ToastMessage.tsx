// lib/toast.tsx
import { toast } from "sonner";
import { LucideIcon } from "lucide-react";

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  position?:
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
  icon?: LucideIcon;
  backgroundColor?: string;
  textColor?: string;
}

export function toastMessage({
  title,
  description,
  duration = 2000,
  position = "top-center",
  icon: Icon,
  backgroundColor = "#a5c7db",
  textColor = "#000",
}: ToastOptions) {
  toast(title, {
    description,
    duration,
    position,
    icon: Icon ? <Icon className="h-4 w-4" /> : undefined,
    style: {
      background: backgroundColor,
      color: textColor,
    },
  });
}

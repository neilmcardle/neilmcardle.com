import type { ReactNode } from "react";

function Icon({ children, size = 26 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function BrushIcon() {
  return (
    <Icon>
      <path d="M14.5 4.5l5 5-7.8 7.8a2 2 0 0 1-1.4.6l-2.1.1.1-2.1a2 2 0 0 1 .6-1.4z" />
      <path d="M8.3 15.9c-1.9-.2-3.6 1-4 2.9l-.3 1.7 1.7-.3c1.9-.4 3.1-2.1 2.9-4" />
      <path d="M12.5 6.5l5 5" />
    </Icon>
  );
}

export function EraserIcon() {
  return (
    <Icon>
      <path d="M8.5 19.5h11" />
      <path d="M13.8 4.9l5.3 5.3a1.5 1.5 0 0 1 0 2.1l-6.9 6.9a1.5 1.5 0 0 1-1 .4H8.3a1.5 1.5 0 0 1-1-.4l-2.4-2.4a1.5 1.5 0 0 1 0-2.1l6.8-6.9a1.5 1.5 0 0 1 2.1-.9z" />
      <path d="M9 10.5l5.5 5.5" />
    </Icon>
  );
}

export function UndoIcon() {
  return (
    <Icon>
      <path d="M9 14L4.5 9.5 9 5" />
      <path d="M4.5 9.5h9.5a5.5 5.5 0 0 1 0 11H11" />
    </Icon>
  );
}

export function RedoIcon() {
  return (
    <Icon>
      <path d="M15 14l4.5-4.5L15 5" />
      <path d="M19.5 9.5H10a5.5 5.5 0 0 0 0 11h3" />
    </Icon>
  );
}

export function NewPageIcon() {
  return (
    <Icon>
      <path d="M6.5 3.5h7l4 4v12a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" />
      <path d="M12 10.5v6M9 13.5h6" />
    </Icon>
  );
}

export function RotateIcon() {
  return (
    <Icon>
      <rect x="3.5" y="9.5" width="11" height="11" rx="1" />
      <path d="M14 3.5a6.5 6.5 0 0 1 6.5 6.5" />
      <path d="M18 8l2.5 2 2-2.5" />
    </Icon>
  );
}

export function TrashIcon() {
  return (
    <Icon>
      <path d="M4.5 6.5h15M9.5 6.5V4.5h5v2" />
      <path d="M6.5 6.5l.9 12.1a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.1" />
    </Icon>
  );
}

export function WallIcon() {
  return (
    <Icon size={22}>
      <rect
        x="3.5"
        y="6.5"
        width="7"
        height="9"
        rx="0.5"
        transform="rotate(-4 7 11)"
      />
      <rect
        x="13.5"
        y="5.5"
        width="7"
        height="9"
        rx="0.5"
        transform="rotate(4 17 10)"
      />
      <path d="M3 20.5h18" />
    </Icon>
  );
}

export function CloseIcon() {
  return (
    <Icon size={22}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Icon>
  );
}

export function PencilIcon() {
  return (
    <Icon size={22}>
      <path d="M15.5 4.5l4 4L9 19H5v-4z" />
      <path d="M13.5 6.5l4 4" />
    </Icon>
  );
}

export function BackIcon() {
  return (
    <Icon size={22}>
      <path d="M15 5l-7 7 7 7" />
    </Icon>
  );
}

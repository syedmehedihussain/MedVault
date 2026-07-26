// Inline SVG icon set used by every screen. All icons are 24x24, stroke-only
// with stroke-linecap=round and stroke-linejoin=round, matching the mockup's
// style. The `currentColor` fill on strokes means utility classes like
// `text-ink-500` or `text-brand-600` re-tint the icon.
//
// Each icon is a small presentational component. They take an optional
// `className` and `strokeWidth` so callers can dial the weight up (the
// mockup uses 2.2–2.4 for camera/magnifier/back, 2 by default).

import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  strokeWidth?: number;
  size?: number;
};

function Icon({
  children,
  strokeWidth = 2,
  size = 24,
  className,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 5l7 7-7 7" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6l-7-2.5Z" />
      <path d="m9 12 2.2 2.2L15 10.5" />
    </Icon>
  );
}

export function ShieldLockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6l-7-2.5Z" />
      <rect x="9" y="11" width="6" height="4" rx="1" />
      <path d="M10.5 11V10a1.5 1.5 0 0 1 3 0v1" />
    </Icon>
  );
}

export function DocumentLinesIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7l-4-4Z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h4" />
    </Icon>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1v-7.5Z" />
    </Icon>
  );
}

export function ChartLineIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M7 14l3-4 3 3 5-7" />
    </Icon>
  );
}

export function PersonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icon>
  );
}

export function DropletIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5c3 4 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 3-7 6-11Z" />
    </Icon>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m5 12 5 5 9-11" />
    </Icon>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H10" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  );
}

export function AlertTriangleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 2 20h20L12 3.5Z" />
      <path d="M12 10v5" />
      <circle cx="12" cy="18" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9.9 5.7A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3.2 4" />
      <path d="M6.4 7.6A16.9 16.9 0 0 0 2.5 12S6 18.5 12 18.5a9.4 9.4 0 0 0 3.9-.85" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m3.5 3.5 17 17" />
    </Icon>
  );
}

// Short-name aliases so screens can write `<Camera size={18} />` without the
// verbose `*Icon` suffix everywhere. The full names remain exported above
// for callers that prefer them.
export const Camera = CameraIcon;
export const Search = SearchIcon;
export const ChevronLeft = ChevronLeftIcon;
export const ChevronRight = ChevronRightIcon;
export const ChevronDown = ChevronDownIcon;
export const Plus = PlusIcon;
export const ShieldCheck = ShieldCheckIcon;
export const ShieldLock = ShieldLockIcon;
export const DocumentLines = DocumentLinesIcon;
export const Home = HomeIcon;
export const ChartLine = ChartLineIcon;
export const Person = PersonIcon;
export const Lock = LockIcon;
export const Droplet = DropletIcon;
export const Download = DownloadIcon;
export const Check = CheckIcon;
export const Spinner = SpinnerIcon;
export const Logout = LogoutIcon;
export const Trash = TrashIcon;
export const AlertTriangle = AlertTriangleIcon;
export const Eye = EyeIcon;
export const EyeOff = EyeOffIcon;

// Public icon component type — used by reportType.ts to type its `icon` field.
export type IconType = (props: IconProps) => React.JSX.Element;

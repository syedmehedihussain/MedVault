// Mint notice card with shield-lock icon and copy reassuring the user
// that data is encrypted and only they can see it. Used on the desktop
// login sidebar and the authed sidebar.

import { ShieldLock } from "./icons";

export default function EncryptedNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl bg-mint ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-brand-600 shadow-[var(--shadow-logo)]">
        <ShieldLock size={18} />
      </span>
      <div className="text-left">
        <p className={`font-bold text-brand-700 ${compact ? "text-[13px]" : "text-sm"}`}>
          End-to-end encrypted
        </p>
        <p className={`text-ink-500 ${compact ? "text-[11px]" : "text-xs"} leading-snug`}>
          Only you can view your records. MedVault never reads your health data.
        </p>
      </div>
    </div>
  );
}
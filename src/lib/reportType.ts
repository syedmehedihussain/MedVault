// Map a report row to its visual treatment — tinted tile color, icon
// component, chip label, and tone. Centralized so dashboard cards, the
// report detail header, and the search chips stay in sync.
//
// `label` is a short category ("Blood test", "Scan"), never the raw
// report_type: the title already shows that, and extracted report_type
// values can be long enough to blow out a card's width.

import {
  Droplet,
  DocumentLines,
  ChartLine,
  ShieldCheck,
  Camera,
  type IconType,
} from "../components/icons";

export type ReportTypeMeta = {
  label: string;
  icon: IconType;
  tile: string;
  tileText: string;
  tone: "mint" | "blood" | "rx" | "scan" | "other";
};

const FALLBACK: ReportTypeMeta = {
  label: "Report",
  icon: DocumentLines,
  tile: "#F4EFE6",
  tileText: "#8B7B5E",
  tone: "other",
};

export function typeForReport(report: {
  report_type: string | null | undefined;
  results?: { test: string; value: string; unit: string; normalRange: string }[];
  source?: "upload" | "partner_hospital" | null;
}): ReportTypeMeta {
  const t = (report.report_type ?? "").toLowerCase();

  if (!t) {
    if (report.source === "partner_hospital") {
      return {
        label: "Partner hospital",
        icon: ShieldCheck,
        tile: "#E3F3F0",
        tileText: "#0E9C90",
        tone: "mint",
      };
    }
    return FALLBACK;
  }

  if (/(cbc|blood|hemo|glucose|sugar|cholesterol|triglyceride|lipid|a1c|hemoglobin)/i.test(t)) {
    return {
      label: "Blood test",
      icon: Droplet,
      tile: "#FBE7E3",
      tileText: "#B0473B",
      tone: "blood",
    };
  }

  if (/(prescript|rx|medic|drug|pharma)/i.test(t)) {
    return {
      label: "Prescription",
      icon: DocumentLines,
      tile: "#FCE9DA",
      tileText: "#B25C1F",
      tone: "rx",
    };
  }

  if (/(x-?ray|ct|mri|scan|imaging|ultra)/i.test(t)) {
    return {
      label: "Scan",
      icon: Camera,
      tile: "#E0EAF7",
      tileText: "#2F5393",
      tone: "scan",
    };
  }

  if (/(trend|chart|panel|profile)/i.test(t)) {
    return {
      label: "Panel",
      icon: ChartLine,
      tile: "#E3F3F0",
      tileText: "#0E9C90",
      tone: "mint",
    };
  }

  return {
    label: "Report",
    icon: DocumentLines,
    tile: "#F4EFE6",
    tileText: "#8B7B5E",
    tone: "other",
  };
}
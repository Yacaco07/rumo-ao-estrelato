import type { Metadata } from "next";
import { DynamicWorldPage } from "@/features/career/dynamic-world-page";

export const metadata: Metadata = { title: "Mundo da carreira" };

export default function WorldPage() { return <DynamicWorldPage />; }

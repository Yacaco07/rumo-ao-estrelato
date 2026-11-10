import type { Metadata } from "next";
import { AthletePage } from "@/features/athlete/athlete-builder";

export const metadata: Metadata = { title: "Meu atleta" };
export default function Page() { return <AthletePage />; }

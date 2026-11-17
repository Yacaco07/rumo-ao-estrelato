import type { Metadata } from "next";
import { CURRENT_WORLD } from "@/data/world/current-world";
import { buildOfferCatalog } from "@/domain/career/initial-offers";
import { InitialOffers } from "@/features/career/initial-offers";

export const metadata: Metadata = { title: "Propostas iniciais" };

export default function OffersPage() {
  return <InitialOffers catalog={buildOfferCatalog(CURRENT_WORLD)} />;
}

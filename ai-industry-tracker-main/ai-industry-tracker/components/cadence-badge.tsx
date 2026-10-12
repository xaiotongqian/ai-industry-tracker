import { Badge } from "@/components/ui/badge";
import { CADENCE_LABEL, type Cadence } from "@/data/types";

export function CadenceBadge({ cadence }: { cadence: Cadence }) {
  return <Badge variant="secondary">{CADENCE_LABEL[cadence]}</Badge>;
}

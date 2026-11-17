import { CONTRACT_ROLE_LABELS, type ContractOffer } from "@/domain/career/contract";

const salaryFormat = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function ContractTerms({ terms }: { terms: ContractOffer }) {
  return <dl className="contract-terms">
    <div><dt>Salário mensal simulado</dt><dd>{salaryFormat.format(terms.monthlySalary)}</dd></div>
    <div><dt>Duração simulada</dt><dd>{terms.months} meses</dd></div>
    <div><dt>Papel simulado</dt><dd>{CONTRACT_ROLE_LABELS[terms.role]}</dd></div>
  </dl>;
}

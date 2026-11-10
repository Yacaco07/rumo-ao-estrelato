import Link from "next/link";
import { Icon } from "@/components/icon";

export default function NotFound() {
  return <section className="empty-state"><span className="eyebrow">FORA DAS QUATRO LINHAS · 404</span><h1>Essa página saiu de campo.</h1><p>Volte à central para continuar sua história.</p><Link className="button button-primary" href="/">Voltar à central <Icon name="right" /></Link></section>;
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATUS_OPTIONS } from "@/lib/constants";
import type { StatusAgendamento } from "@/lib/types/database.types";

/**
 * Formulário de filtros da listagem/relatórios. É um Server Component: o
 * submit é uma navegação GET nativa (`?status=...&busca=...`), funcionando
 * mesmo sem JavaScript no cliente.
 */
export function FiltrosBar({
  action,
  status,
  busca,
  de,
  ate,
  mostrarBusca = true,
}: {
  action: string;
  status?: StatusAgendamento;
  busca?: string;
  de?: string;
  ate?: string;
  mostrarBusca?: boolean;
}) {
  return (
    <form action={action} method="get" className="flex flex-wrap items-end gap-3">
      {mostrarBusca && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="busca">Buscar</Label>
          <Input
            id="busca"
            name="busca"
            placeholder="Nº OS, cliente ou tipo de serviço"
            defaultValue={busca}
            className="w-64"
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">Todos</option>
          {STATUS_OPTIONS.map((opcao) => (
            <option key={opcao.value} value={opcao.value}>
              {opcao.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="de">De</Label>
        <Input id="de" name="de" type="date" defaultValue={de} className="w-40" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ate">Até</Label>
        <Input id="ate" name="ate" type="date" defaultValue={ate} className="w-40" />
      </div>

      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
      <Button type="button" variant="ghost" asChild>
        <a href={action}>Limpar</a>
      </Button>
    </form>
  );
}

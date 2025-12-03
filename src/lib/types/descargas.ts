/**
 * Tipos para las descargas rápidas predefinidas
 */

export type BloqueDescargaId =
  | "ministerios"
  | "ministerios-mails"
  | "global";

export type DescargaParamType = "string" | "number" | "select";

export type DescargaParam = {
  name: string;
  label: string;
  type: DescargaParamType;
  optionsEndpoint?: string;   // ej: "/api/meta/ministerios" para combos
  required?: boolean;
  defaultValue?: string | number;
};

export type DescargaConfig = {
  slug: string;
  bloque: BloqueDescargaId;
  nombre: string;
  descripcion: string;
  params?: DescargaParam[];
  allowDistinct?: boolean;       // muestra o no checkbox
  defaultDistinct?: boolean;     // si inicia tildado
  distinctColumns?: string[];    // columnas clave para DISTINCT
  buildSql: (options: {
    params?: Record<string, any>;
    distinct?: boolean;
  }) => string;
};

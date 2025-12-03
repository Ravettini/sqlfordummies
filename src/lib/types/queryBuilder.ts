/**
 * Tipos para el constructor visual de queries tipo Scratch
 * 
 * Define la estructura de datos que representa una consulta SQL
 * de forma tipada y segura, sin permitir SQL arbitrario del usuario.
 */

// Referencia a una tabla
export type TableRef = {
  name: string;      // ej: "dotacion_gcba_prueba"
  alias?: string;    // ej: "d"
};

// Referencia a una columna (tabla + columna)
export type ColumnRef = {
  table: string;     // nombre de tabla o alias
  column: string;    // nombre de columna, ej: "CUIL"
};

// Operadores de comparación soportados
export type ConditionOperator =
  | "="
  | "!="
  | ">"
  | "<"
  | ">="
  | "<="
  | "BETWEEN"
  | "LIKE"
  | "IN";

// Condición WHERE
export type Condition = {
  left: ColumnRef;
  operator: ConditionOperator;
  rightValue?: any;          // valor literal
  rightColumn?: ColumnRef;   // para comparaciones entre columnas
  betweenValues?: [any, any]; // para BETWEEN
  inValues?: any[];          // para IN
};

// Tipo de JOIN (por ahora no se usa, pero preparado para futuras iteraciones)
export type JoinType = "INNER" | "LEFT" | "RIGHT";

// JOIN entre tablas
export type Join = {
  type: JoinType;
  from: TableRef;
  to: TableRef;
  on: Condition; // condición de join
};

// Dirección de ordenamiento
export type OrderDirection = "ASC" | "DESC";

// Ordenamiento
export type OrderBy = {
  column: ColumnRef;
  direction: OrderDirection;
};

// Agrupamiento
export type GroupBy = ColumnRef;

// Estructura completa de una query
export type QueryStructure = {
  select: ColumnRef[];       // columnas a seleccionar
  from: TableRef;            // tabla principal
  joins?: Join[];            // joins opcionales (futuro)
  where?: Condition[];       // condiciones WHERE (unidas con AND)
  groupBy?: GroupBy[];       // agrupamiento
  orderBy?: OrderBy[];       // ordenamiento
  limit?: number | null;     // límite de filas (opcional, null = sin límite)
  distinct?: boolean;         // si true, usar SELECT DISTINCT
};


export type DefaultCategory = {
  name: string;
  type: "INCOME" | "EXPENSE";
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: "Vivienda", type: "EXPENSE" },
  { name: "Alimentación", type: "EXPENSE" },
  { name: "Transporte", type: "EXPENSE" },
  { name: "Salud", type: "EXPENSE" },
  { name: "Entretenimiento", type: "EXPENSE" },
  { name: "Ingresos - Sueldo", type: "INCOME" },
  { name: "Ingresos - Otros", type: "INCOME" },
];

interface EquipmentFilterProps {
  defaultQuery: string;
}

export function EquipmentFilter({ defaultQuery }: EquipmentFilterProps) {
  return (
    <form method="get" action="/equipment" role="search" className="flex h-9 items-center">
      <label htmlFor="equipment-q" className="sr-only">
        Search equipment by name
      </label>
      <input
        id="equipment-q"
        name="q"
        type="text"
        defaultValue={defaultQuery}
        placeholder="Search…"
        autoComplete="off"
        className="border-input bg-background focus-within:border-ring focus-within:ring-ring/30 h-9 w-56 rounded-md border px-3 text-sm transition-colors outline-none focus-within:ring-2"
      />
    </form>
  );
}

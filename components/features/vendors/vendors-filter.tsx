/**
 * Filter controls for /vendors. Plain GET form so it works without JS.
 */
interface VendorsFilterProps {
  defaultQuery: string;
  defaultType: string;
}

export function VendorsFilter({ defaultQuery, defaultType }: VendorsFilterProps) {
  return (
    <form method="get" action="/vendors" role="search" className="flex h-9 items-center gap-2">
      <label htmlFor="vendors-q" className="sr-only">
        Search vendors by name
      </label>
      <input
        id="vendors-q"
        name="q"
        type="text"
        defaultValue={defaultQuery}
        placeholder="Search…"
        autoComplete="off"
        className="border-input bg-background focus-within:border-ring focus-within:ring-ring/30 h-9 w-44 rounded-md border px-3 text-sm transition-colors outline-none focus-within:ring-2"
      />
      <label htmlFor="vendors-type" className="sr-only">
        Filter by type
      </label>
      <select
        id="vendors-type"
        name="type"
        defaultValue={defaultType}
        className="border-input bg-background focus-within:border-ring focus-within:ring-ring/30 h-9 rounded-md border px-2 text-sm transition-colors outline-none focus-within:ring-2"
      >
        <option value="">All types</option>
        <option value="supplier">Supplier</option>
        <option value="contractor">Contractor</option>
        <option value="service">Service</option>
      </select>
    </form>
  );
}

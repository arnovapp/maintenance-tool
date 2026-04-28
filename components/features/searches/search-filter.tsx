/**
 * Submit-on-enter filter for the searches list.
 *
 * Uses a plain HTML form with method=GET so it works without JS:
 * pressing Enter reloads /searches with `?q=value`. The page reads
 * the search param server-side and re-runs the query. No client
 * runtime needed.
 */
interface SearchFilterProps {
  defaultValue: string;
}

export function SearchFilter({ defaultValue }: SearchFilterProps) {
  return (
    <form
      method="get"
      action="/searches"
      role="search"
      className="border-input bg-background focus-within:border-ring focus-within:ring-ring/30 flex h-9 w-full items-center rounded-md border px-3 transition-colors focus-within:ring-2 sm:w-72"
    >
      <label htmlFor="searches-filter" className="sr-only">
        Filter past searches
      </label>
      <input
        id="searches-filter"
        name="q"
        type="text"
        autoComplete="off"
        spellCheck={false}
        defaultValue={defaultValue}
        placeholder="Filter…"
        className="placeholder:text-muted-foreground/70 w-full bg-transparent text-sm outline-none"
      />
    </form>
  );
}

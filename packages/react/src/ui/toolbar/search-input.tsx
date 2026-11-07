import { useEffect, useState, type ReactElement } from 'react';

import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';

/** Wait after the last keystroke before searching, in milliseconds. */
const SEARCH_DELAY_MS = 200;

/**
 * The search box. It searches after typing pauses, and follows the query when it changes from
 * outside, such as a URL change or "clear all".
 * @returns The search field.
 */
export function SearchInput(): ReactElement {
  const { query, setQuery, locale } = useModel();
  const [text, setText] = useState(query.search);

  useEffect(() => setText(query.search), [query.search]);

  useEffect(() => {
    if (text === query.search) return;
    const timer = setTimeout(() => {
      setQuery((current) => ({ ...current, search: text, page: { ...current.page, index: 0 } }));
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
    // Only typing starts a search; a query change from outside is copied in above.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [text]);

  return (
    <label className="tv-search">
      <Icon name="search" />
      <input
        className="tv-search-input"
        type="search"
        aria-label={locale.search}
        placeholder={locale.search}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </label>
  );
}

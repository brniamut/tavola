import type { ColumnBuilder } from './column-builder.type.ts';
import type { ColumnKind, ColumnSpec, DataColumnOptions, EnumOption } from './column-spec.type.ts';
import { ACTIONS_COLUMN_ID } from './column-sizes.ts';
import { humanize } from './humanize.ts';

/** Default width of the actions column, in pixels: room for one icon button. */
const ACTIONS_SIZE_PX = 56;

/** Kinds the search box looks at unless a column says otherwise. */
const SEARCHABLE_KINDS: ReadonlySet<ColumnKind> = new Set(['text', 'enum']);

/**
 * Normalises enum options to `{ value, label }`.
 * @param options The options as the developer wrote them.
 * @returns One entry per option.
 */
function normaliseOptions(
  options: readonly EnumOption<unknown>[],
): { value: unknown; label: string }[] {
  return options.map((option) =>
    typeof option === 'object' && option !== null && 'value' in option && 'label' in option
      ? { value: option.value, label: String(option.label) }
      : { value: option, label: String(option) },
  );
}

/**
 * The behaviour settings of a column, with defaults for what the developer left out.
 * @param kind The column kind.
 * @param options What the developer passed.
 * @returns Sortable, filterable, searchable, hideable, reorderable, resizable and alignment.
 */
function behaviour<TRow>(
  kind: ColumnKind,
  options: DataColumnOptions<TRow, never>,
): Omit<
  ColumnSpec<TRow>['settings'],
  'size' | 'minSize' | 'maxSize' | 'pin' | 'hidden' | 'className' | 'priority' | 'group'
> {
  const defaults = {
    sortable: true,
    filterable: true,
    searchable: SEARCHABLE_KINDS.has(kind),
    hideable: true,
    reorderable: true,
    resizable: true,
    align: kind === 'number' ? 'end' : 'start',
  } as const;
  const given = Object.fromEntries(
    Object.keys(defaults)
      .map((key) => [key, options[key as keyof typeof defaults]])
      .filter(([, value]) => value !== undefined),
  );
  return { ...defaults, ...given };
}

/**
 * Builds the spec for a column that reads a field.
 * @param kind The column kind.
 * @param key The row key, which is also the column id.
 * @param options What the developer passed.
 * @returns The column spec.
 */
function dataColumn<TRow>(
  kind: ColumnKind,
  key: string,
  options: DataColumnOptions<TRow, never> & { options?: readonly EnumOption<unknown>[] } = {},
): ColumnSpec<TRow> {
  const render = options.cell as ((context: { value: unknown; row: TRow }) => unknown) | undefined;
  return {
    id: key,
    header: options.header ?? humanize(key),
    kind,
    accessor: (row) => (row as Record<string, unknown>)[key],
    ...(render && { render: (row: TRow, value: unknown) => render({ value, row }) as never }),
    ...(options.options && { options: normaliseOptions(options.options) }),
    settings: { ...behaviour(kind, options), ...pickLayout(options) },
  };
}

/**
 * Copies the optional layout settings that are set, so `exactOptionalPropertyTypes` holds.
 * @param options What the developer passed.
 * @returns Only the layout settings that have a value.
 */
function pickLayout<TRow>(
  options: DataColumnOptions<TRow, never>,
): Pick<
  ColumnSpec<TRow>['settings'],
  'size' | 'minSize' | 'maxSize' | 'pin' | 'hidden' | 'className' | 'priority' | 'group'
> {
  const keys = [
    'size',
    'minSize',
    'maxSize',
    'pin',
    'hidden',
    'className',
    'priority',
    'group',
  ] as const;
  return Object.fromEntries(
    keys.filter((key) => options[key] !== undefined).map((key) => [key, options[key]]),
  );
}

/** Settings of columns that do not show a field: no sorting, filtering or search. */
const DISPLAY_SETTINGS = { sortable: false, filterable: false, searchable: false } as const;

/**
 * Creates the column builder that `defineColumns` hands to its callback.
 * @returns A builder with one method per column kind.
 */
export function createColumnBuilder<TRow>(): ColumnBuilder<TRow> {
  return {
    text: (key, options) => dataColumn('text', key, options as never),
    number: (key, options) => dataColumn('number', key, options as never),
    date: (key, options) => dataColumn('date', key, options as never),
    enum: (key, options) => dataColumn('enum', key, options as never),
    boolean: (key, options) => dataColumn('boolean', key, options as never),
    display: (id, options) => ({
      id,
      header: options.header ?? humanize(id),
      kind: 'display',
      render: (row) => options.cell(row),
      settings: {
        ...DISPLAY_SETTINGS,
        hideable: options.hideable ?? true,
        reorderable: options.reorderable ?? true,
        resizable: options.resizable ?? true,
        align: options.align ?? 'start',
        ...pickLayout(options as DataColumnOptions<TRow, never>),
      },
    }),
    actions: (getActions, options = {}) => ({
      id: ACTIONS_COLUMN_ID,
      header: options.header ?? '',
      kind: 'display',
      actions: getActions,
      settings: {
        ...DISPLAY_SETTINGS,
        hideable: false,
        reorderable: false,
        resizable: false,
        align: 'end',
        pin: 'end',
        size: options.size ?? ACTIONS_SIZE_PX,
      },
    }),
  };
}

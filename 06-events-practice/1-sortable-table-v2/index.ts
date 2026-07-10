import SortableTableV1 from "../../05-dom-document-loading/2-sortable-table-v1";

const collator = new Intl.Collator(["ru", "en"], { caseFirst: "upper" });

type SortOrder = "asc" | "desc";

type SortableTableData = Record<string, string | number>;

type SortableTableSort = {
  id: string;
  order: SortOrder;
};

type BaseHeadersConfig = ConstructorParameters<typeof SortableTableV1>[0];

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: "string" | "number" | "custom";
  template?: (value: string | number) => string;
  customSorting?: (a: SortableTableData, b: SortableTableData) => number;
}

interface Options {
  data?: SortableTableData[];
  sorted?: SortableTableSort;
  isSortLocally?: boolean;
}

export default class SortableTable extends SortableTableV1 {
  isSortLocally: boolean;

  constructor(
    headersConfig: SortableTableHeader[] = [],
    { data = [], sorted, isSortLocally = true }: Options = {},
  ) {
    super(headersConfig as unknown as BaseHeadersConfig, data);

    this.isSortLocally = isSortLocally;

    this.bindEvents();

    sorted && this.sort(sorted.id, sorted.order);
  }

  private bindEvents = (): void => {
    const { header } = this.subElements;

    header?.addEventListener("pointerdown", this.handleHeaderPointerDown);
  };

  private unbindEvents = (): void => {
    const { header } = this.subElements;

    header?.removeEventListener("pointerdown", this.handleHeaderPointerDown);
  };

  private handleHeaderPointerDown = ({ target }: PointerEvent): void => {
    if (!(target instanceof Element)) return;

    const sortableHeader = target.closest<HTMLElement>(
      ".sortable-table__cell[data-sortable=true]",
    );

    if (!sortableHeader) return;

    const field = sortableHeader.dataset.id;
    const order = sortableHeader.dataset.order === "desc" ? "asc" : "desc";

    if (!field || !order) return;

    this.sort(field, order);
  };

  private getSortTypeComparator(
    header: SortableTableHeader,
    field: string,
  ): (a: SortableTableData, b: SortableTableData) => number {
    const { sortType, customSorting } = header;

    return (a, b) => {
      const fieldA = a[field];
      const fieldB = b[field];

      switch (sortType) {
        case "string":
          return collator.compare(String(fieldA), String(fieldB));

        case "number":
          return Number(fieldA) - Number(fieldB);

        case "custom":
          return customSorting ? customSorting(a, b) : 0;

        default:
          return 0;
      }
    };
  }

  sort = (field: string, order: SortOrder): void => {
    const header = this.headersConfig.find((header) => header.id === field) as
      | SortableTableHeader
      | undefined;

    if (!header || !header.sortable) {
      return;
    }

    if (!this.hasSortChanged(field, order)) {
      return;
    }

    const data = [...this.data].sort(this.getSortTypeComparator(header, field));

    const sortedData = order === "asc" ? data : data.reverse();

    this.update({
      data: sortedData,
      field,
      order,
    });
  };

  destroy() {
    this.unbindEvents();
    super.destroy();
  }
}

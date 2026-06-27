import { createElement } from "../../shared/utils/create-element";

const collator = new Intl.Collator(["ru", "en"], { caseFirst: "upper" });

type SortOrder = "asc" | "desc";

type SortableTableData = Record<string, string | number>;

interface SortableTableHeader {
  id: string;
  title: string;
  sortable?: boolean;
  sortType?: "string" | "number";
  template?: (value: string | number) => string;
}

interface SortState {
  data: SortableTableData[];
  field: string;
  order: SortOrder;
}

export default class SortableTable {
  element: HTMLElement | null;
  subElements: Record<string, HTMLElement> = {};
  private field: string = "";
  private order: SortOrder = "asc";

  constructor(
    private headersConfig: SortableTableHeader[] = [],
    private data: SortableTableData[] = [],
  ) {
    this.element = createElement(this.template);
    this.subElements = this.getSubElements();
    console.dir(this);
  }

  sort(field: string, order: SortOrder): void {
    const header = this.headersConfig.find((header) => header.id === field);

    if (!header || !header.sortable) {
      return;
    }

    if (!this.hasSortChanged(field, order)) {
      return;
    }

    const data = [...this.data].sort((a, b) => {
      const fieldA = a[field];
      const fieldB = b[field];

      if (header.sortType === "string") {
        return collator.compare(String(fieldA), String(fieldB));
      }

      if (header.sortType === "number") {
        return Number(fieldA) - Number(fieldB);
      }

      return 0;
    });

    const sortedData = order === "asc" ? data : data.reverse();

    this.update({
      data: sortedData,
      field,
      order,
    });
  }

  private hasSortChanged = (field: string, order: SortOrder): boolean => {
    return this.field !== field || this.order !== order;
  };

  update = (nextState: SortState): void => {
    const { body, header } = this.subElements;

    this.data = nextState.data;
    this.field = nextState.field;
    this.order = nextState.order;

    header.innerHTML = this.renderHeaderItems();
    body.innerHTML = this.renderBodyItems();
  };

  private renderHeaderItems = (): string => {
    const headerCells = this.headersConfig.map((header) => {
      const { id, title, sortable = false } = header;

      const orderAttribute =
        this.field === id ? `data-order="${this.order}"` : "";

      return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${orderAttribute}>
          <span>${title}</span>
        </div>
      `;
    });

    return headerCells.join("");
  };

  private renderBodyItems = (): string => {
    const headers = this.headersConfig;

    return this.data
      .map((item) => {
        const rowCells = headers
          .map((header) => {
            if (header.id === "images" && header.template) {
              return header.template(item.images);
            }

            return `
              <div class="sortable-table__cell">${item[header.id]}</div>
            `;
          })
          .join("");

        return `
          <a href="${item.id}" class="sortable-table__row">
            ${rowCells}
          </a>
        `;
      })
      .join("");
  };

  private getSubElements = (): Record<string, HTMLElement> => {
    if (!this.element) {
      return {};
    }

    const subElements =
      this.element.querySelectorAll<HTMLElement>("[data-element]");

    return [...subElements].reduce<Record<string, HTMLElement>>(
      (subElements, currentElement) => {
        const key = currentElement.dataset.element;

        if (key) {
          subElements[key] = currentElement;
        }

        return subElements;
      },
      {},
    );
  };

  private get template(): string {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">

          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.renderHeaderItems()}
          </div>

          <div data-element="body" class="sortable-table__body">
            ${this.renderBodyItems()}
          </div>

          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  remove() {
    this.element!.remove();
  }

  destroy() {
    this.remove();

    this.subElements = {};
  }
}

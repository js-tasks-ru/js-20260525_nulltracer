import { createElement } from "../../shared/utils/create-element";

interface Options {
  data: number[];
  label: string;
  value: number;
  link: string;
  formatHeading: (value: number) => string;
}

type Status = "loading" | "ready";

export default class ColumnChart {
  private data: number[];
  private label: string;
  private value: string;
  private link: string;
  public chartHeight: number;
  public element: HTMLElement | null = null;
  private subElements: Record<string, HTMLElement> = {};

  constructor({
    data = [],
    label = "",
    value = 0,
    link = "",
    formatHeading = (value) => value.toLocaleString(),
  }: Partial<Options> = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.chartHeight = 50;

    this.render();
  }

  private render = (): void => {
    this.element = createElement(this.template());
    this.subElements = this.getSubElements();
  };

  private get status(): Status {
    if (!this.data.length) return "loading";

    return "ready";
  }

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

  private renderLink = (): string => {
    const { link } = this;

    if (!link) return "";

    return `
      <a href="/${link}" class="column-chart__link">View all</a>
    `;
  };

  private renderTitle = (): string => {
    return `
      <div class="column-chart__title">
        Total ${this.label}
        ${this.renderLink()}
      </div>
    `;
  };

  private getClassName = (): string => {
    return ["column-chart", this.status === "loading" && "column-chart_loading"]
      .filter(Boolean)
      .join(" ");
  };

  private renderHeader = (): string => {
    return `
      <div data-element="header" class="column-chart__header">${this.value}</div>
    `;
  };

  private renderChart = (): string => {
    const { data, chartHeight } = this;

    if (!data.length) {
      return "";
    }

    const maxValue = Math.max(...this.data);
    const scale = chartHeight / maxValue;

    const renderColumn = (item: number): string => {
      const colHeight = Math.floor(item * scale);
      const tooltip = ((item / maxValue) * 100).toFixed(0) + "%";

      return `
          <div style="--value: ${colHeight}" data-tooltip="${tooltip}"></div>
        `;
    };

    return data.map(renderColumn).join("");
  };

  private renderBody = (): string => {
    return `
      <div data-element="body" class="column-chart__chart">
        ${this.renderChart()}
      </div>
    `;
  };

  private renderContainer = (): string => {
    return `
      <div class="column-chart__container">
        ${this.renderHeader()}
        ${this.renderBody()}
      </div>
    `;
  };

  private addEventListeners = (): void => {};
  private removeEventListeners = (): void => {};

  public remove = (): void => {
    if (this.element instanceof HTMLElement) {
      this.element.remove();
    }
  };

  public destroy = (): void => {
    this.removeEventListeners();

    this.remove();

    this.element = null;
    this.subElements = {};
  };

  public update = (data: number[] = []): void => {
    const { body } = this.subElements;

    if (!this.element || !body) return;

    this.data = data;
    this.element.className = this.getClassName();
    body.innerHTML = this.renderChart();
  };

  private template = (): string => {
    const { getClassName, renderTitle, renderContainer, chartHeight } = this;

    return `
      <div class="${getClassName()}" style="--chart-height: ${chartHeight}">
        ${renderTitle()}
        ${renderContainer()}
      </div>
    `;
  };
}

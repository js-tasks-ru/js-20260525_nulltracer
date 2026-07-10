import { createElement } from "../../shared/utils/create-element";

type DoubleSliderSelected = {
  from: number;
  to: number;
};

interface Options {
  min?: number;
  max?: number;
  formatValue?: (value: number) => string;
  selected?: DoubleSliderSelected;
}

const defaultOptions: Required<Options> = {
  min: 0,
  max: 100,
  formatValue: (value) => String(value),
  selected: {
    from: 0,
    to: 100,
  },
};

type SubElements = {
  from: HTMLElement;
  to: HTMLElement;
  inner: HTMLElement;
  progress: HTMLElement;
  thumbLeft: HTMLElement;
  thumbRight: HTMLElement;
};

type ThumbElement = SubElements["thumbLeft"] | SubElements["thumbRight"];

type RangeSelectDetail = {
  from: number;
  to: number;
};

export default class DoubleSlider {
  element: HTMLElement;
  subElements: SubElements;

  readonly min: number;
  readonly max: number;

  from: number;
  to: number;

  private formatValue: (value: number) => string;

  private activeThumb: ThumbElement | null = null;
  private thumbShiftX = 0;
  private sliderInnerRect: DOMRect | null = null;

  constructor(options: Options = {}) {
    const normalizedOptions = this.normalizeOptions(options);

    this.min = normalizedOptions.min;
    this.max = normalizedOptions.max;
    this.formatValue = normalizedOptions.formatValue;
    this.from = normalizedOptions.selected.from;
    this.to = normalizedOptions.selected.to;

    this.element = this.createElement();
    this.subElements = this.getSubElements();

    this.init();
  }

  private normalizeOptions(options: Options): Required<Options> {
    const min = options.min ?? defaultOptions.min;
    const max = options.max ?? defaultOptions.max;

    return {
      min,
      max,
      formatValue: options.formatValue ?? defaultOptions.formatValue,
      selected: {
        from: options.selected?.from ?? min,
        to: options.selected?.to ?? max,
      },
    };
  }

  private init(): void {
    this.setRange();
    this.bindEvents();
  }

  private setRange(): void {
    const { thumbLeft, thumbRight, progress } = this.subElements;
    const { min, max, from, to } = this;

    const offsetFromLeft = (from - min) / (max - min);
    const offsetFromRight = (max - to) / (max - min);

    const leftRange = `${Math.round(offsetFromLeft * 100)}%`;
    const rightRange = `${Math.round(offsetFromRight * 100)}%`;

    thumbLeft.style.left = progress.style.left = leftRange;
    thumbRight.style.right = progress.style.right = rightRange;
  }

  private getActiveThumbStats() {
    const { thumbLeft, thumbRight } = this.subElements;
    const { activeThumb } = this;

    return {
      direction: activeThumb === thumbLeft ? "left" : "right",
      sibling: activeThumb === thumbLeft ? thumbRight : thumbLeft,
      isLeftThumb: activeThumb === thumbLeft,
    } as const;
  }

  private update(position: number): void {
    this.updateThumbPosition(position);
    this.updateRangeCounter(position);
  }

  private updateThumbPosition(position: number): void {
    if (!this.activeThumb) return;

    const { progress } = this.subElements;
    const { direction } = this.getActiveThumbStats();

    const positionPercent = `${position}%`;

    this.activeThumb.style[direction] = positionPercent;
    progress.style[direction] = positionPercent;
  }

  private updateRangeCounter(thumbPosition: number): void {
    const { from, to } = this.subElements;
    const { isLeftThumb } = this.getActiveThumbStats();
    const { min, max, formatValue } = this;

    const rangeValue = Math.round(
      (isLeftThumb ? min : max) +
        ((max - min) / 100) * (isLeftThumb ? 1 : -1) * thumbPosition,
    );

    if (isLeftThumb) {
      this.from = rangeValue;
      from.textContent = formatValue(rangeValue);
    } else {
      this.to = rangeValue;
      to.textContent = formatValue(rangeValue);
    }
  }

  private getSubElements(): SubElements {
    const elements =
      this.element.querySelectorAll<HTMLElement>("[data-element]");

    return [...elements].reduce<Record<string, HTMLElement>>(
      (subElements, element) => {
        const key = element.dataset.element;

        if (key) {
          subElements[key] = element;
        }

        return subElements;
      },
      {},
    ) as SubElements;
  }

  private isThumbElement(target: EventTarget | null): target is ThumbElement {
    const { thumbLeft, thumbRight } = this.subElements;

    return target === thumbLeft || target === thumbRight;
  }

  private handlePointerDown = (event: PointerEvent): void => {
    const { target } = event;

    if (!this.isThumbElement(target)) return;

    this.activeThumb = target;
    this.sliderInnerRect = this.subElements.inner.getBoundingClientRect();

    this.setThumbShiftX(event);

    document.documentElement.style.cursor = "grab";

    this.activeThumb.ondragstart = () => false;
  };

  private setThumbShiftX(event: PointerEvent): void {
    if (!this.activeThumb) return;

    const { inner } = this.subElements;

    const thumbOffset =
      this.element.offsetLeft + inner.offsetLeft + this.activeThumb.offsetLeft;

    this.thumbShiftX = event.clientX - thumbOffset;
  }

  private dispatchEvent(name: string, detail: RangeSelectDetail): void {
    this.element.dispatchEvent(
      new CustomEvent<RangeSelectDetail>(name, {
        detail,
        bubbles: true,
      }),
    );
  }

  private handlePointerUp = (): void => {
    if (!this.activeThumb) return;

    document.documentElement.style.cursor = "";

    this.dispatchEvent("range-select", {
      from: this.from,
      to: this.to,
    });

    this.activeThumb = null;
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.activeThumb || !this.sliderInnerRect) return;

    const thumbPosition = this.calcThumbPosition(event);
    const boundedPosition = this.filterBoundaries(thumbPosition);

    this.update(boundedPosition);
  };

  private calcThumbPosition(event: PointerEvent): number {
    if (!this.activeThumb || !this.sliderInnerRect) {
      return 0;
    }

    const { isLeftThumb } = this.getActiveThumbStats();

    const {
      left: sliderLeftX,
      width: sliderWidth,
      right: sliderRightX,
    } = this.sliderInnerRect;

    const thumbWidth = this.activeThumb.offsetWidth;

    const offsetX = isLeftThumb
      ? event.clientX - sliderLeftX - this.thumbShiftX + thumbWidth
      : sliderRightX - event.clientX + this.thumbShiftX;

    return (offsetX / sliderWidth) * 100;
  }

  private filterBoundaries(position: number): number {
    const { direction, sibling } = this.getActiveThumbStats();

    const siblingDirection = direction === "left" ? "right" : "left";
    const siblingThumbOffset = sibling.style[siblingDirection];

    return Math.max(
      0,
      Math.min(position, 100 - (parseFloat(siblingThumbOffset) || 0)),
    );
  }

  private get template(): string {
    const { from, to, formatValue } = this;

    return `
      <div class="range-slider">
        <span data-element="from">${formatValue(from)}</span>

        <div data-element="inner" class="range-slider__inner">
          <span data-element="progress" class="range-slider__progress"></span>
          <span data-element="thumbLeft" class="range-slider__thumb-left"></span>
          <span data-element="thumbRight" class="range-slider__thumb-right"></span>
        </div>

        <span data-element="to">${formatValue(to)}</span>
      </div>
    `;
  }

  private createElement(): HTMLElement {
    return createElement(this.template);
  }

  private bindEvents(): void {
    this.subElements.inner.addEventListener(
      "pointerdown",
      this.handlePointerDown,
    );

    document.addEventListener("pointerup", this.handlePointerUp);
    document.addEventListener("pointermove", this.handlePointerMove);
  }

  private unbindEvents(): void {
    this.subElements.inner.removeEventListener(
      "pointerdown",
      this.handlePointerDown,
    );

    document.removeEventListener("pointerup", this.handlePointerUp);
    document.removeEventListener("pointermove", this.handlePointerMove);
  }

  remove(): void {
    this.element.remove();
  }

  destroy(): void {
    this.unbindEvents();
    this.remove();
  }
}

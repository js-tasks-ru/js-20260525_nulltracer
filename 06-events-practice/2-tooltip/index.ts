import { createElement } from "../../shared/utils/create-element";

export default class Tooltip {
  static instance: Tooltip | null = null;

  public element!: HTMLElement;

  private shiftX = 10;
  private shiftY = 10;

  constructor() {
    if (Tooltip.instance) {
      return Tooltip.instance;
    }

    Tooltip.instance = this;
  }

  handlePointerOver = ({ target, x, y }: PointerEvent): void => {
    if (!(target instanceof HTMLElement)) return;

    const tooltip = target.dataset.tooltip;

    if (!tooltip) return;

    this.render(tooltip);
    this.updatePos(x, y);

    target.addEventListener("pointermove", this.handlePointerMove);
    target.addEventListener("pointerout", this.handlePointerOut, {
      once: true,
    });
  };

  handlePointerOut = ({ target }: PointerEvent): void => {
    if (!(target instanceof HTMLElement)) return;

    this.remove();
    target.removeEventListener("pointermove", this.handlePointerMove);
  };

  handlePointerMove = ({ x, y }: PointerEvent): void => {
    this.updatePos(x, y);
  };

  updatePos = (x: number, y: number): void => {
    this.element.style.left = `${x + this.shiftX}px`;
    this.element.style.top = `${y + this.shiftY}px`;
  };

  initialize = () => {
    document.addEventListener("pointerover", this.handlePointerOver);
  };

  unbindEvents = () => {
    document.removeEventListener("pointerover", this.handlePointerOver);
  };

  render(html: string): void {
    this.element = createElement(this.template(html));

    document.body.append(this.element);
  }

  remove(): void {
    this.element.remove();
  }

  destroy(): void {
    this.remove();
    this.unbindEvents();

    Tooltip.instance = null;
  }

  private template(html: string) {
    return `
      <div class="tooltip">${html}</div>
    `;
  }
}

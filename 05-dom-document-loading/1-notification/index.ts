import { createElement } from "../../shared/utils/create-element";

function formatDuration(duration: number): string {
  return `${duration / 1000}s`;
}

interface Options {
  duration?: number;
  type?: "success" | "error";
}

type NormalizedOptions = Required<Options>;

export default class NotificationMessage {
  static activeNotification: NotificationMessage | null = null;

  element: HTMLElement | null = null;
  timeoutId: number | null = null;
  private options: NormalizedOptions;

  constructor(
    private message: string,
    options: Options = {},
  ) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.destroy();
    }

    this.options = {
      duration: 2000,
      type: "success",
      ...options,
    };
    this.element = createElement(this.template);

    NotificationMessage.activeNotification = this;
  }

  show = (target: HTMLElement = document.body): void => {
    target.append(this.element!);
    this.timeoutId = setTimeout(this.destroy, this.options.duration);
  };

  remove = (): void => {
    this.element?.remove();
  };

  destroy = (): void => {
    this.remove();

    if (NotificationMessage.activeNotification === this) {
      NotificationMessage.activeNotification = null;
    }

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.element = null;
  };

  private get template(): string {
    const { message, options } = this;
    const { type, duration } = options;

    return `
      <div class="notification ${type}" style="--value: ${formatDuration(duration)}">
        <div class="timer"></div>
            <div class="inner-wrapper">
            <div class="notification-header">Notification</div>
            <div class="notification-body">
              ${message}
            </div>
        </div>
      </div>
    `;
  }
}

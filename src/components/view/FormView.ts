import { Component } from '../base/Component';

export interface FormProps {
  valid: boolean;
  errors?: Record<string, string>; // ошибки по полям
}

export abstract class FormView<T extends FormProps> extends Component<T> {
  protected formEl: HTMLFormElement;
  protected errorEl: HTMLElement;
  protected submitBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);

    this.formEl = container as HTMLFormElement;
    this.errorEl = container.querySelector('.form__errors')!;
    this.submitBtn = container.querySelector('button[type="submit"]')!;
  }

  set valid(value: boolean) {
    this.submitBtn.disabled = !value;
  }

  set errors(value: Record<string, string> | undefined) {
    if (!value) {
      this.errorEl.textContent = '';
    } else {
      this.errorEl.textContent = Object.values(value).join('; ');
    }
  }
}

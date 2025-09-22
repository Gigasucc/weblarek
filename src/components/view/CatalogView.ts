export class CatalogView {
  constructor(private readonly container: HTMLElement) {}

  renderCards(cards: HTMLElement[]) {
    this.container.replaceChildren(...cards);
  }
}


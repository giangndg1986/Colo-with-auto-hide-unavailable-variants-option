if (!customElements.get("sht-quantity-input")) {
  class SHTQuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector(`.js-quantity-input`);
      this.changeEvent = new Event("change", { bubbles: true });

      this.querySelectorAll(".js-quantity-button").forEach((button) =>
        button.addEventListener("click", this.onButtonClickHandler.bind(this))
      );
    }

    onButtonClickHandler(event) {
      event.preventDefault();
      let previousValue = this.input.value;

      event.currentTarget.dataset.name === "plus"
        ? this.input.stepUp()
        : this.input.stepDown();

      if (previousValue !== this.input.value) {
        this.input.dispatchEvent(this.changeEvent);
      }
    }
  }
  customElements.define("sht-quantity-input", SHTQuantityInput);
}

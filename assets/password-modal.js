/**
 * Password modal Form web component.
 * Use this component to render Password modal element
 */
if (!customElements.get("sht-password-modal")) {
  class SHTPasswordModal extends HTMLElement {
    constructor() {
      super();
      this.elms = {
        detailsElm: this.querySelector("details"),
        summaryElm: this.querySelector("summary"),
      };

      this.onBodyClickEventHandle = null;
      this.bindEventHandlers();

      this.elms.summaryElm.setAttribute("role", "button");
      if (this.querySelector('input[aria-invalid="true"]'))
        this.open({ target: this.querySelector("details") });
    }

    /**
     * bind event handler to web component elements
     */
    bindEventHandlers() {
      this.elms.detailsElm.addEventListener(
        "keyup",
        (event) => event.code.toUpperCase() === "ESCAPE" && this.close()
      );
      this.elms.summaryElm.addEventListener(
        "click",
        this.onSummaryClickHandle.bind(this)
      );
      this.closeBtn = this.querySelectorAll(
        'button[data-type="modal-btn-close"]'
      );
      this.closeBtn.forEach((btn) => {
        btn.addEventListener("click", (event) => {
          this.close();
        });
      });
    }
    /**
     * Check modal is open / not
     * @returns boolean
     */
    isOpen() {
      return this.elms.detailsElm.hasAttribute("open");
    }
    /**
     * Handle Summary Click event
     * @param {*} event
     */
    onSummaryClickHandle(event) {
      event.preventDefault();
      event.target.closest("details").hasAttribute("open")
        ? this.close()
        : this.open(event);
    }
    /**
     * Handle on body click event
     * @param {} event
     */
    onBodyClickHandle(event) {
      if (!this.contains(event.target)) this.close();
    }
    /**
     * Open modal
     * @param {*} event
     */
    open(event) {
      this.onBodyClickEventHandle =
        this.onBodyClickEventHandle || this.onBodyClickHandle.bind(this);
      event.target.closest("details").setAttribute("open", true);
      document.body.addEventListener("click", this.onBodyClickEventHandle);
      document.body.classList.add("password-modal-open");

      this.elms.detailsElm
        .querySelector('[tabindex="-1"]')
        .querySelector('input:not([type="hidden"])')
        .focus();
    }
    /**
     * Close Modal
     */
    close() {
      this.elms.summaryElm.focus();
      this.elms.detailsElm.removeAttribute("open");
      document.body.removeEventListener("click", this.onBodyClickEventHandle);
      document.body.classList.remove("password-modal-open");
    }
  }

  customElements.define("sht-password-modal", SHTPasswordModal);
}

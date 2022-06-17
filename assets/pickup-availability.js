if (!customElements.get("sht-pickup-availability")) {
  customElements.define(
    "sht-pickup-availability",
    class SHTPickupAvailability extends HTMLElement {
      constructor() {
        super();
        if (!this.hasAttribute("available")) return;

        this.errorHtml =
          this.querySelector("template").content.firstElementChild.cloneNode(
            true
          );
        this.onClickRefreshListHandleEvent =
          this.onClickRefreshListHandleEvent.bind(this);

        this.fetchAvailability(this.dataset.variantId);
      }

      fetchAvailability(variantId) {
        let rootUrl = routes.root_url;
        if (!rootUrl.endsWith("/")) {
          rootUrl = rootUrl + "/";
        }
        let url = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;
        fetch(url)
          .then((response) => response.text())
          .then((text) => {
            let sectionInnerHTML = new DOMParser()
              .parseFromString(text, "text/html")
              .querySelector(".shopify-section");
            this.renderPreview(sectionInnerHTML);
          })
          .catch((e) => {
            let button = this.querySelector("button");
            if (button)
              button.removeEventListener(
                "click",
                this.onClickRefreshListHandleEvent
              );
            this.renderError();
          });
      }

      onClickRefreshListHandleEvent(evt) {
        this.fetchAvailability(this.dataset.variantId);
      }

      renderError() {
        this.innerHTML = "";
        this.appendChild(this.errorHtml);
        this.querySelector("button").addEventListener(
          "click",
          this.onClickRefreshListHandleEvent
        );
      }

      renderPreview(sectionInnerHTML) {
        let drawer = document.querySelector("sht-pickup-availability-drawer");
        let preview = sectionInnerHTML.querySelector(
          "sht-pickup-availability-preview"
        );

        drawer && drawer.remove();

        if (!preview) {
          this.innerHTML = "";
          this.removeAttribute("available");
          return;
        }

        this.innerHTML = preview.outerHTML;
        this.setAttribute("available", "");

        document.body.appendChild(
          sectionInnerHTML.querySelector("sht-pickup-availability-drawer")
        );
        let button = this.querySelector("button");
        button &&
          button.addEventListener("click", (e) => {
            document
              .querySelector("sht-pickup-availability-drawer")
              .show(e.target);
          });
      }
    }
  );
}

if (!customElements.get("sht-pickup-availability-drawer")) {
  customElements.define(
    "sht-pickup-availability-drawer",
    class PickupAvailabilityDrawer extends HTMLElement {
      constructor() {
        super();
        this.onBodyClick = this.handleBodyClickHandleEvent.bind(this);
        this.querySelector("button").addEventListener("click", () => {
          this.hide();
        });
        this.addEventListener("keyup", (event) => {
          if (event.code.toUpperCase() === "ESCAPE") this.hide();
        });
      }

      handleBodyClickHandleEvent(evt) {
        let target = evt.target;

        if (
          target != this &&
          !target.closest("sht-pickup-availability-drawer") &&
          target.id != "ShowPickupAvailabilityDrawer"
        ) {
          this.hide();
        }
      }

      hide() {
        this.removeAttribute("open");
        document.body.removeEventListener("click", this.onBodyClick);
        document.body.classList.remove("ovfw-hdn");
      }

      show(element) {
        this.setAttribute("open", "");
        document.body.addEventListener("click", this.onBodyClick);
        document.body.classList.add("ovfw-hdn");
      }
    }
  );
}

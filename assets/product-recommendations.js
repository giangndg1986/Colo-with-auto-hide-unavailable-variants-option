if (!customElements.get("sht-product-recommendations")) {
  class SHTProductRecommendations extends HTMLElement {
    constructor() {
      super();
      const handleIntersection = (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);

        fetch(this.dataset.url)
          .then((response) => response.text())
          .then((text) => {
            const html = document.createElement("div");
            html.innerHTML = text;
            const recommendations = html.querySelector(
              "sht-product-recommendations"
            );
            if (recommendations && recommendations.innerHTML.trim().length) {
              this.innerHTML = recommendations.innerHTML;
            }
          })
          .catch((e) => {
            console.error(e);
          });
      };

      new IntersectionObserver(handleIntersection.bind(this)).observe(this);
    }
  }

  customElements.define(
    "sht-product-recommendations",
    SHTProductRecommendations
  );
}
(() => {
  "use strict";

  const rowSelector = [
    "body.in-kosik .cart-table tr.removeable",
    ".cart-window .cart-table tr.removeable"
  ].join(",");

  const addRemoveButton = row => {
    const quantityCell = row.querySelector(":scope > .p-quantity");
    const originalButton = row.querySelector(
      ":scope > .p-total .remove-item"
    );

    if (
      !quantityCell ||
      !originalButton ||
      quantityCell.querySelector(".meglos-remove-under-qty")
    ) {
      return;
    }

    const holder = document.createElement("div");
    const button = document.createElement("button");

    holder.className = "meglos-remove-under-qty";

    button.type = "button";
    button.className = "meglos-remove-button";
    button.setAttribute(
      "aria-label",
      "Odebrat produkt z košíku"
    );

    button.innerHTML = `
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>
      </svg>
      <span>Odebrat z košíku</span>
    `;

    button.addEventListener("click", () => {
      const currentOriginalButton = row.querySelector(
        ":scope > .p-total .remove-item"
      );

      if (currentOriginalButton) {
        currentOriginalButton.click();
      }
    });

    holder.append(button);
quantityCell.append(holder);

if (row.closest(".cart-window")) {
  requestAnimationFrame(() => {
    const quantity = quantityCell.querySelector(".quantity");

    if (quantity) {
      const quantityBox = quantity.getBoundingClientRect();
      const holderBox = holder.getBoundingClientRect();

      const offset =
        quantityBox.left +
        quantityBox.width / 2 -
        holderBox.left -
        holderBox.width / 2;

      holder.style.transform = `translateX(${offset}px)`;
    }
  });
}

row.classList.add("meglos-remove-ready");

    
  };

  const updateCartRows = () => {
    document
      .querySelectorAll(rowSelector)
      .forEach(addRemoveButton);
  };

  const start = () => {
    const observer = new MutationObserver(() => {
      observer.disconnect();
      updateCartRows();

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });

    updateCartRows();

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start,
      { once: true }
    );
  } else {
    start();
  }
})();

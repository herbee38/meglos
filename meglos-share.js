(function () {
  function getProductUrl() {
    return (
      document.querySelector('link[rel="canonical"]')?.href ||
      window.location.href.split('#')[0]
    );
  }

  function showCopied(link) {
    const label = link.querySelector('span');
    if (!label) return;

    label.textContent = 'Zkopírováno';

    window.setTimeout(function () {
      label.textContent = 'Sdílet';
    }, 1800);
  }

  function oldCopy(link, url) {
    const field = document.createElement('textarea');
    field.value = url;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.left = '-9999px';

    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, field.value.length);

    const copied = document.execCommand('copy');
    field.remove();

    if (copied) {
      showCopied(link);
    } else {
      window.prompt('Zkopírujte odkaz na produkt:', url);
    }
  }

  function copyLink(link, url) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(function () {
          showCopied(link);
        })
        .catch(function () {
          oldCopy(link, url);
        });
    } else {
      oldCopy(link, url);
    }
  }

  window.meglosShareProduct = function (link, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (link.dataset.shareBusy === '1') return false;
    link.dataset.shareBusy = '1';

    const label = link.querySelector('span');
    const productName =
      document.querySelector('h1')?.textContent.trim() || document.title;
    const shareUrl = getProductUrl();

    window.setTimeout(function () {
      delete link.dataset.shareBusy;
    }, 800);

    if (typeof navigator.share === 'function') {
      if (label) label.textContent = 'Sdílím…';

      navigator.share({
        title: productName,
        text: productName,
        url: shareUrl
      }).then(function () {
        if (label) label.textContent = 'Sdílet';
      }).catch(function () {
        if (label) label.textContent = 'Sdílet';
        copyLink(link, shareUrl);
      });
    } else {
      copyLink(link, shareUrl);
    }

    return false;
  };

  function addShareButton() {
    const area = document.querySelector(
      'body.type-product .social-buttons-wrapper .link-icons'
    );

    if (!area || area.querySelector('.meglos-share-button')) return;

    const shareUrl = getProductUrl();
    const link = document.createElement('a');

    link.href =
      'https://www.facebook.com/sharer/sharer.php?u=' +
      encodeURIComponent(shareUrl);

    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'meglos-share-button';
    link.setAttribute('role', 'button');
    link.setAttribute('aria-label', 'Sdílet produkt');
    link.setAttribute(
      'onclick',
      'return window.meglosShareProduct(this,event);'
    );

    link.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="18" cy="5" r="2.5"></circle>
        <circle cx="6" cy="12" r="2.5"></circle>
        <circle cx="18" cy="19" r="2.5"></circle>
        <path d="M8.2 10.8 15.8 6.3M8.2 13.2l7.6 4.5"></path>
      </svg>
      <span>Sdílet</span>
    `;

    area.appendChild(link);
  }

  function initShare() {
    addShareButton();

    if (!window.meglosShareCapture) {
      document.addEventListener(
        'click',
        function (event) {
          const link = event.target.closest
            ? event.target.closest('.meglos-share-button')
            : null;

          if (link) {
            window.meglosShareProduct(link, event);
          }
        },
        true
      );

      window.meglosShareCapture = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShare);
  } else {
    initShare();
  }
})();
/* MEGLOS – kotva pro cross-sell na detailu produktu */
(function () {
    function addCrossSellAnchor() {
        if (!document.body.classList.contains('type-product')) return;

        const tabs = document.querySelector('.shp-tabs-row.responsive-nav');
        if (!tabs || document.querySelector('#meglos-crosssell-anchor')) return;

        const anchor = document.createElement('div');
        anchor.id = 'meglos-crosssell-anchor';

        tabs.parentNode.insertBefore(anchor, tabs);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addCrossSellAnchor);
    } else {
        addCrossSellAnchor();
    }
})();
/* =========================================================
   MEGLOS – CROSS SELL: DETAIL PRODUKTU + KOŠÍK
   ========================================================= */

(function () {

    function formatPrice(value) {
        return new Intl.NumberFormat('cs-CZ').format(value) + ' Kč';
    }

    /* Najde karty konkrétního typu nabídky addonu */
    function getOfferCards(type) {
        return [
            ...new Set(
                [...document.querySelectorAll(
                    '[data-product-offer-type="' + type + '"]'
                )]
                    .map(el => el.closest('.up-product'))
                    .filter(Boolean)
            )
        ];
    }

    /* U variantního produktu zobrazit nejnižší cenu */
    function setMinVariantPrice(card) {
        const select = card.querySelector('.up-variants');
        if (!select) return;

        const prices = [...select.options]
            .map(option => Number(option.dataset.price))
            .filter(Number.isFinite);

        if (!prices.length) return;

        const priceEl = card.querySelector('.up-price-value');
        if (!priceEl) return;

        const text = 'od ' + formatPrice(Math.min(...prices));

        if (priceEl.textContent.trim() !== text) {
            priceEl.textContent = text;
        }
    }


    /* =====================================================
       CROSS SELL NA DETAILU PRODUKTU
       ===================================================== */

    function setupProductCrossSell() {

        const cards = getOfferCards('product_cross');
        if (!cards.length) return;

        const parents = new Set(
            cards.map(card => card.parentElement).filter(Boolean)
        );

        /* Grid + vlastní nadpis */
        parents.forEach(parent => {

            parent.classList.add('mgl-crosssell-grid');

            const container = parent.parentElement;
            if (!container) return;

            if (!container.querySelector('.mgl-crosssell-heading-wrap')) {

                const heading = document.createElement('div');
                heading.className = 'mgl-crosssell-heading-wrap';

                heading.innerHTML = `
                    <h2 class="mgl-crosssell-heading">
                        Doplňte svůj dárek
                    </h2>
                    <p class="mgl-crosssell-subheading">
                        Vyberte si doplňky, které udělají váš dárek ještě osobnější.
                    </p>
                `;

                container.insertBefore(heading, parent);
            }
        });

        cards.forEach(card => {

            card.classList.add('mgl-crosssell-card');

            const productLink =
                card.querySelector('.up-product-name .up-product-url') ||
                card.querySelector('.up-image .up-product-url');

            if (!productLink) return;

            setMinVariantPrice(card);

            /* Vlastní tlačítko Jít na detail */
            if (!card.querySelector('.mgl-crosssell-detail-btn')) {

                const button = document.createElement('a');

                button.className = 'mgl-crosssell-detail-btn';
                button.href = productLink.href;
                button.textContent = 'Jít na detail';

                card.appendChild(button);
            }
        });
    }


    /* =====================================================
       CROSS SELL V KOŠÍKU
       ===================================================== */

    function setupCartCrossSell() {

        const cards = getOfferCards('cart');
        if (!cards.length) return;
      cards.forEach(card => {
    card.classList.add('mgl-cart-crosssell-card');
});
  const cartWrapper = cards[0]?.parentElement;

if (cartWrapper) {
    cartWrapper.classList.add('mgl-cart-crosssell-wrapper');
}    

        /* Nadpis nabídky v košíku */
        document.querySelectorAll(
            '.up-container.up-type-cart .up-products-header'
        ).forEach(heading => {

            if (heading.textContent.trim() !== 'Doplňte svůj dárek') {
                heading.textContent = 'Doplňte svůj dárek';
            }
        });


        cards.forEach(card => {

            /*
             * Konfigurovatelné přání:
             * zákazník musí jít na detail produktu
             */
            const productLink = card.querySelector(
                'a.up-product-url[href*="/darkove-prani-s-vlastnim-textem/"]'
            );

            if (!productLink) return;

            card.classList.add('mgl-cart-configurable-product');

            setMinVariantPrice(card);

            /* Tlačítko Vybrat přání */
            if (!card.querySelector('.mgl-cart-detail-btn')) {

                const button = document.createElement('a');

                button.className = 'mgl-cart-detail-btn';
                button.href = productLink.href;
                button.textContent = 'Vybrat přání';

                const priceContainer = card.querySelector(
                    '.up-product-price-container'
                );

                if (priceContainer) {
                    priceContainer.appendChild(button);
                }
            }
        });
    }


    /* =====================================================
       SPOLEČNÉ SPUŠTĚNÍ
       ===================================================== */

    function initCrossSell() {
        setupProductCrossSell();
        setupCartCrossSell();
    }


    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            initCrossSell
        );

    } else {

        initCrossSell();
    }


    /*
     * Upsell addon se načítá / překresluje dynamicky.
     * Stačí jeden observer pro detail i košík.
     */
    let timer;

    const observer = new MutationObserver(function () {

        clearTimeout(timer);

        timer = window.setTimeout(function () {
            initCrossSell();
        }, 120);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();

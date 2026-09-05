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
   MEGLOS – ÚPRAVA CROSS SELL PRODUKTŮ
   ========================================================= */

(function () {

    function formatPrice(value) {
        return new Intl.NumberFormat('cs-CZ').format(value) + ' Kč';
    }

    function setupCrossSell() {

        const cards = [
            ...document.querySelectorAll(
                '.up-product:has([data-product-offer-type="product_cross"])'
            )
        ];

        if (!cards.length) return;

        /* Označíme rodičovský seznam jako grid */
        const parents = new Set(cards.map(card => card.parentElement));

        parents.forEach(parent => {
            if (parent) parent.classList.add('mgl-crosssell-grid');

/* MEGLOS – vlastní nadpis cross-sellu */
parents.forEach(parent => {
    if (!parent) return;

    const container = parent.parentElement;
    if (!container) return;

 /* Schovat původní nadpis cross-sell doplňku */
document.querySelectorAll('body *').forEach(el => {
    if (el.closest('.mgl-crosssell-heading-wrap')) return;

    if ((el.textContent || '').trim() === 'Doplňte svůj dárek') {
        el.style.display = 'none';
    }
});

    /* Přidat vlastní nadpis jen jednou */
    if (!container.querySelector('.mgl-crosssell-heading-wrap')) {
        const heading = document.createElement('div');
        heading.className = 'mgl-crosssell-heading-wrap';

        heading.innerHTML = `
            <h2 class="mgl-crosssell-heading">Doplňte svůj dárek</h2>
            <p class="mgl-crosssell-subheading">
                Vyberte si doplňky, které udělají váš dárek ještě osobnější.
            </p>
        `;

        container.insertBefore(heading, parent);
    }
});

          
        });

        cards.forEach(card => {

            card.classList.add('mgl-crosssell-card');

            /* URL detailu produktu */
            const productLink =
                card.querySelector('.up-product-name .up-product-url') ||
                card.querySelector('.up-image .up-product-url');

            if (!productLink) return;

            /* U variantního produktu zobrazíme nejnižší cenu jako "od ..." */
            const variantSelect = card.querySelector('.up-variants');

            if (variantSelect) {

                const prices = [...variantSelect.options]
                    .map(option => Number(option.dataset.price))
                    .filter(price => Number.isFinite(price));

                if (prices.length) {
                    const minPrice = Math.min(...prices);
                    const priceEl = card.querySelector('.up-price-value');

                    if (priceEl) {
                        priceEl.textContent = 'od ' + formatPrice(minPrice);
                    }
                }
            }

            /* Vlastní tlačítko */
            if (!card.querySelector('.mgl-crosssell-detail-btn')) {

                const button = document.createElement('a');

                button.className = 'mgl-crosssell-detail-btn';
                button.href = productLink.href;
                button.textContent = 'Jít na detail';

                card.appendChild(button);
            }
        });
    }

    /* První načtení */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupCrossSell);
    } else {
        setupCrossSell();
    }

    /*
     * Doplněk může obsah překreslovat dynamicky,
     * proto úpravu zopakujeme při změně DOM.
     */
    let timer;

    const observer = new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(setupCrossSell, 100);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();

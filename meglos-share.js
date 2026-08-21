(function () {
  function addShareButton() {
    const area = document.querySelector(
      'body.type-product .social-buttons-wrapper .link-icons'
    );

    if (!area || area.querySelector('.meglos-share-button')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'meglos-share-button';
    button.setAttribute('aria-label', 'Sdílet produkt');

    button.innerHTML = `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="18" cy="5" r="2.5"></circle>
        <circle cx="6" cy="12" r="2.5"></circle>
        <circle cx="18" cy="19" r="2.5"></circle>
        <path d="M8.2 10.8 15.8 6.3M8.2 13.2l7.6 4.5"></path>
      </svg>
      <span>Sdílet</span>
    `;

    area.appendChild(button);

    const label = button.querySelector('span');
    const productName =
      document.querySelector('h1')?.textContent.trim() || document.title;

    const shareUrl =
      document.querySelector('link[rel="canonical"]')?.href ||
      window.location.href.split('#')[0];

    async function copyLink() {
      try {
        await navigator.clipboard.writeText(shareUrl);
        label.textContent = 'Zkopírováno';

        window.setTimeout(function () {
          label.textContent = 'Sdílet';
        }, 1800);
      } catch (error) {
        window.prompt('Zkopírujte odkaz na produkt:', shareUrl);
      }
    }

    button.addEventListener('click', async function () {
      if (navigator.share) {
        try {
          await navigator.share({
            title: productName,
            text: productName,
            url: shareUrl
          });
        } catch (error) {
          if (error.name !== 'AbortError') await copyLink();
        }
      } else {
        await copyLink();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addShareButton);
  } else {
    addShareButton();
  }
})();

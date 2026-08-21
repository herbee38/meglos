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
  }

  function showCopied(button) {
    const label = button.querySelector('span');
    if (!label) return;

    label.textContent = 'Zkopírováno';

    window.setTimeout(function () {
      label.textContent = 'Sdílet';
    }, 1800);
  }

  function oldCopy(button, url) {
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
      showCopied(button);
    } else {
      window.prompt('Zkopírujte odkaz na produkt:', url);
    }
  }

  function copyLink(button, url) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(function () {
          showCopied(button);
        })
        .catch(function () {
          oldCopy(button, url);
        });
    } else {
      oldCopy(button, url);
    }
  }

  function handleShare(event) {
    const button = event.target.closest
      ? event.target.closest('.meglos-share-button')
      : null;

    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    const productName =
      document.querySelector('h1')?.textContent.trim() || document.title;

    const shareUrl =
      document.querySelector('link[rel="canonical"]')?.href ||
      window.location.href.split('#')[0];

    if (typeof navigator.share === 'function') {
      navigator.share({
        title: productName,
        text: productName,
        url: shareUrl
      }).catch(function (error) {
        if (error.name !== 'AbortError') {
          copyLink(button, shareUrl);
        }
      });
    } else {
      copyLink(button, shareUrl);
    }
  }

  function initShare() {
    addShareButton();

    if (!window.meglosShareListener) {
      document.addEventListener('click', handleShare, true);
      window.meglosShareListener = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShare);
  } else {
    initShare();
  }
})();

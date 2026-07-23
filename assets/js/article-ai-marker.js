export const setupArticleAiMarker = () => {
  document.querySelectorAll('[data-ai-marker-toggle]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const details = toggle.parentElement.querySelector('[data-ai-marker-details]');
      const expanded = toggle.getAttribute('aria-expanded') !== 'true';

      toggle.setAttribute('aria-expanded', String(expanded));
      details.hidden = !expanded;
    });
  });
};

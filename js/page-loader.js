// Global page loader — shared across all pages
(function () {
    // Inject loader div + styles once
    const style = document.createElement('style');
    style.textContent = `
#global-loader {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(255,255,255,0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.25s ease;
}
#global-loader.hidden {
    opacity: 0;
    pointer-events: none;
}
#global-loader::after {
    content: "";
    width: 44px;
    height: 44px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #4a7c59;
    border-radius: 50%;
    animation: gl-spin 0.8s linear infinite;
}
@keyframes gl-spin { to { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);

    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.classList.add('hidden');
    document.body ? document.body.appendChild(loader) : document.addEventListener('DOMContentLoaded', () => document.body.appendChild(loader));

    window.showLoader = function () {
        const el = document.getElementById('global-loader');
        if (el) el.classList.remove('hidden');
    };

    window.hideLoader = function () {
        const el = document.getElementById('global-loader');
        if (el) el.classList.add('hidden');
    };
})();

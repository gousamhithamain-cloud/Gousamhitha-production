(function () {
    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
    
    window.showToast = function (message, type = "success") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.innerText = message;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add("show");
        }, 50);
        
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    };
})();
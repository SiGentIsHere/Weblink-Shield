// Clear all local storage (this removes the stuck auth session)
localStorage.clear();
sessionStorage.clear();

// Then reload the page
window.location.reload();
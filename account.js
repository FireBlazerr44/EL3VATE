let wishlist = [];
let cart = [];

function init() {
    checkAuth();
    loadData();
    renderWishlist();
    setupEventListeners();
}

function checkAuth() {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'auth.html';
    }
}

function loadData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name || 'User';
        document.getElementById('detail-name').textContent = currentUser.name || '-';
        document.getElementById('detail-email').textContent = currentUser.email || '-';
    }

    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
        wishlist = JSON.parse(savedWishlist);
    }
    document.getElementById('wishlist-count').textContent = wishlist.length;
}

function renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    
    if (wishlist.length === 0) {
        grid.innerHTML = '<p class="wishlist-empty">Your wishlist is empty. Browse products and add your favorites!</p>';
        return;
    }
    
    const wishlistProducts = products.filter(p => wishlist.includes(p.id));
    
    grid.innerHTML = wishlistProducts.map(product => `
        <div class="wishlist-card">
            <div class="wishlist-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="wishlist-info">
                <h4>${product.name}</h4>
                <p class="wishlist-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart-wishlist" data-id="${product.id}">ADD TO BAG</button>
                <button class="remove-wishlist" data-id="${product.id}">&times;</button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.add-to-cart-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(parseInt(btn.dataset.id));
        });
    });
    
    document.querySelectorAll('.remove-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromWishlist(parseInt(btn.dataset.id));
        });
    });
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    document.getElementById('cart-count').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    showToast('Added to bag!');
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    document.getElementById('wishlist-count').textContent = wishlist.length;
    renderWishlist();
    showToast('Removed from wishlist');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function setupEventListeners() {
    document.querySelectorAll('.cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    });
    
    document.querySelectorAll('.profile-dropdown-item.signout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
    
    document.getElementById('menu-favorites').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('wishlist-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    document.getElementById('favorites-link').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'account.html';
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}

document.addEventListener('DOMContentLoaded', init);

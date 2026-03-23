let cart = [];
let currentCategory = 'all';
let maxPrice = 500;

function init() {
    renderProducts();
    setupEventListeners();
    checkAuth();
}

function checkAuth() {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'auth.html';
    }
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    const title = document.querySelector('.products-title');
    
    let filteredProducts = products.filter(product => {
        const categoryMatch = currentCategory === 'all' || product.category === currentCategory;
        const priceMatch = product.price <= maxPrice;
        return categoryMatch && priceMatch;
    });

    const sortValue = document.getElementById('sort-select').value;
    if (sortValue === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'newest') {
        filteredProducts.sort((a, b) => b.new - a.new);
    }

    const categoryNames = {
        'all': 'All Products',
        'shoes': 'Shoes',
        'clothing': 'Clothing',
        'accessories': 'Accessories',
        'equipment': 'Equipment'
    };
    title.textContent = categoryNames[currentCategory];

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.new ? '<span class="product-badge">NEW</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${product.category}</p>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">ADD TO BAG</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart(parseInt(btn.dataset.id));
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
    
    updateCartUI();
    showToast();
}

function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Your bag is empty</p>';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                <p class="cart-item-qty">Qty: ${item.quantity}</p>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">&times;</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(parseInt(btn.dataset.id));
        });
    });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function setupEventListeners() {
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderProducts();
        });
    });

    document.getElementById('price-slider').addEventListener('input', (e) => {
        maxPrice = parseInt(e.target.value);
        document.getElementById('price-display').textContent = maxPrice;
        renderProducts();
    });

    document.getElementById('sort-select').addEventListener('change', () => {
        renderProducts();
    });

    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.closest('#account-btn')) {
                logout();
            } else {
                document.getElementById('cart-sidebar').classList.add('open');
            }
        });
    });

    document.getElementById('close-cart').addEventListener('click', () => {
        document.getElementById('cart-sidebar').classList.remove('open');
    });

    document.addEventListener('click', (e) => {
        const cartSidebar = document.getElementById('cart-sidebar');
        if (e.target === cartSidebar) {
            cartSidebar.classList.remove('open');
        }
    });

    document.querySelectorAll('.profile-dropdown-item.signout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}

document.addEventListener('DOMContentLoaded', init);

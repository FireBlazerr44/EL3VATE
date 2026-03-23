let cart = [];
let wishlist = [];
let currentCategory = 'all';
let maxPrice = 500;
let selectedSize = null;
let currentModalProduct = null;
let allProducts = [];

function init() {
    loadCart();
    loadWishlist();
    loadAllProducts();
    renderProducts();
    setupEventListeners();
    checkAuth();
    updateCartUI();
}

function loadAllProducts() {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    allProducts = [...products, ...adminProducts];
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function checkAuth() {
    const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'auth.html';
    }
}

function loadWishlist() {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
        wishlist = JSON.parse(saved);
    }
}

function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function renderProducts() {
    loadAllProducts();
    const grid = document.getElementById('products-grid');
    const title = document.querySelector('.products-title');
    
    let filteredProducts = allProducts.filter(product => {
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

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', () => {
            openProductModal(parseInt(card.dataset.id));
        });
    });
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    showToast();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
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
                <div class="cart-item-qty">
                    <button class="qty-btn qty-minus" data-id="${item.id}">&minus;</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-id="${item.id}">&plus;</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">&times;</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    document.getElementById('cart-badge').textContent = totalItems;
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(parseInt(btn.dataset.id));
        });
    });
    
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            updateQuantity(parseInt(btn.dataset.id), -1);
        });
    });
    
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            updateQuantity(parseInt(btn.dataset.id), 1);
        });
    });
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function openProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    currentModalProduct = product;
    selectedSize = null;
    
    document.getElementById('modal-image').src = product.image;
    document.getElementById('modal-category').textContent = product.category;
    document.getElementById('modal-name').textContent = product.name;
    document.getElementById('modal-price').textContent = `$${product.price.toFixed(2)}`;
    document.getElementById('modal-description').textContent = product.description;
    
    const wishlistBtn = document.getElementById('modal-wishlist');
    if (wishlist.includes(productId)) {
        wishlistBtn.classList.add('active');
        wishlistBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Added to Wishlist
        `;
    } else {
        wishlistBtn.classList.remove('active');
        wishlistBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Add to Wishlist
        `;
    }
    
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
    
    document.getElementById('product-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function toggleWishlist() {
    if (!currentModalProduct) return;
    
    const productId = currentModalProduct.id;
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        wishlist.push(productId);
    }
    
    saveWishlist();
    openProductModal(productId);
    showToastMessage(wishlist.includes(productId) ? 'Added to Wishlist!' : 'Removed from Wishlist');
}

function showToastMessage(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        toast.textContent = 'Added to bag!';
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

    document.querySelectorAll('.cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('cart-sidebar').classList.add('open');
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

    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.profile-dropdown').forEach(dropdown => {
                dropdown.classList.toggle('active');
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-dropdown')) {
            document.querySelectorAll('.profile-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });

    document.getElementById('close-modal').addEventListener('click', closeProductModal);
    
    document.getElementById('product-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('product-modal')) {
            closeProductModal();
        }
    });
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.textContent;
        });
    });
    
    document.getElementById('modal-add-to-cart').addEventListener('click', () => {
        if (currentModalProduct) {
            addToCart(currentModalProduct.id);
            closeProductModal();
        }
    });
    
    document.getElementById('modal-wishlist').addEventListener('click', toggleWishlist);
    
    document.getElementById('search-input').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const grid = document.getElementById('products-grid');
        
        const filteredProducts = allProducts.filter(product => {
            const categoryMatch = currentCategory === 'all' || product.category === currentCategory;
            const priceMatch = product.price <= maxPrice;
            const searchMatch = product.name.toLowerCase().includes(searchTerm) || 
                              product.category.toLowerCase().includes(searchTerm);
            return categoryMatch && priceMatch && searchMatch;
        });
        
        const categoryNames = {
            'all': 'All Products',
            'shoes': 'Shoes',
            'clothing': 'Clothing',
            'accessories': 'Accessories',
            'equipment': 'Equipment'
        };
        document.querySelector('.products-title').textContent = searchTerm ? `Search: "${searchTerm}"` : categoryNames[currentCategory];
        
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
        
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', () => {
                openProductModal(parseInt(card.dataset.id));
            });
        });
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    window.location.href = 'auth.html';
}

document.getElementById('checkout-btn').addEventListener('click', () => {
    if (cart.length > 0) {
        window.location.href = 'checkout.html';
    } else {
        showToastMessage('Your cart is empty');
    }
});

document.getElementById('hamburger-btn').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('active');
});

document.addEventListener('DOMContentLoaded', init);

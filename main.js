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
    updateWishlistBadge();
}

function loadAllProducts() {
    const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
    const deletedProducts = JSON.parse(localStorage.getItem('deletedProducts') || '[]');
    const deletedIds = deletedProducts.map(p => p.id);
    
    allProducts = adminProducts.filter(p => !deletedIds.includes(p.id));
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

function isInWishlist(productId, size) {
    return wishlist.some(item => item.productId === productId && item.size === size);
}

function checkProductStock(productId, size) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return { inStock: false, stock: 0 };
    
    if (size) {
        const sizeData = product.sizes?.find(s => s.size === size);
        return { inStock: sizeData ? sizeData.stock > 0 : false, stock: sizeData ? sizeData.stock : 0 };
    }
    
    const hasStock = product.sizes?.some(s => s.stock > 0) || false;
    const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) || 0;
    return { inStock: hasStock, stock: totalStock };
}

function showStockNotification(productId, size) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const { inStock, stock } = checkProductStock(productId, size);
    
    const notification = document.createElement('div');
    notification.className = 'stock-notification';
    
    if (inStock) {
        notification.className += ' in-stock';
        notification.innerHTML = `
            <span class="notification-icon">✓</span>
            <span class="notification-text"><strong>${product.name}</strong> ${size ? `(Size ${size})` : ''} is now in stock!</span>
        `;
    } else {
        notification.className += ' out-of-stock';
        notification.innerHTML = `
            <span class="notification-icon">🔔</span>
            <span class="notification-text"><strong>${product.name}</strong> ${size ? `(Size ${size})` : ''} is out of stock. We'll notify you when it's back!</span>
        `;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
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
    loadAllProducts();
    const product = allProducts.find(p => p.id === productId);
    
    if (!product) return;
    
    const size = selectedSize || 'One Size';
    const existingItem = cart.find(item => item.id === productId && item.size === size);
    
    const sizeData = product.sizes?.find(s => s.size === size);
    const availableStock = sizeData ? sizeData.stock : 999;
    const currentCartQty = existingItem ? existingItem.quantity : 0;
    
    if (currentCartQty >= availableStock) {
        showToastMessage('Not enough stock available');
        return;
    }
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1, size: size });
    }
    
    if (sizeData) {
        sizeData.stock--;
        const adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
        const productIndex = adminProducts.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
            adminProducts[productIndex] = product;
            localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
        }
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
    const cartBadge = document.getElementById('cart-badge');
    const cartTotal = document.getElementById('cart-total');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="cart-empty">Your bag is empty</p>';
        cartTotal.textContent = '$0.00';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}" data-size="${item.size || 'One Size'}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-size">Size: ${item.size || 'One Size'}</p>
                <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                <div class="cart-item-qty">
                    <button class="qty-btn qty-minus" data-id="${item.id}" data-size="${item.size || 'One Size'}">&minus;</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-id="${item.id}" data-size="${item.size || 'One Size'}">&plus;</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}" data-size="${item.size || 'One Size'}">&times;</button>
        </div>
    `).join('');
}

function updateWishlistBadge() {
    const wishlistBadge = document.getElementById('wishlist-badge');
    wishlistBadge.textContent = wishlist.length;
}

function renderWishlist() {
    const wishlistItems = document.getElementById('wishlist-items');
    
    updateWishlistBadge();
    
    if (wishlist.length === 0) {
        wishlistItems.innerHTML = '<p class="cart-empty">Your wishlist is empty</p>';
        return;
    }
    
    wishlistItems.innerHTML = wishlist.map(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (!product) return '';
        
        const sizeData = product.sizes?.find(s => s.size === item.size);
        const inStock = sizeData ? sizeData.stock > 0 : true;
        
        return `
            <div class="wishlist-item">
                <img src="${product.image}" alt="${product.name}" class="wishlist-item-image">
                <div class="wishlist-item-details">
                    <h4 class="wishlist-item-name">${product.name}</h4>
                    <p class="wishlist-item-size">Size: ${item.size}</p>
                    <p class="wishlist-item-price">$${product.price.toFixed(2)}</p>
                    <p class="wishlist-item-stock ${inStock ? 'in-stock' : 'out-of-stock'}">
                        ${inStock ? 'In Stock' : 'Out of Stock'}
                    </p>
                    <div class="wishlist-item-actions">
                        ${inStock ? `<button class="wishlist-add-cart" data-id="${item.productId}" data-size="${item.size}">Add to Bag</button>` : ''}
                        <button class="wishlist-remove" data-id="${item.productId}" data-size="${item.size}">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.wishlist-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.id);
            const size = btn.dataset.size;
            selectedSize = size;
            addToCart(productId);
            renderWishlist();
        });
    });
    
    document.querySelectorAll('.wishlist-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = parseInt(btn.dataset.id);
            const size = btn.dataset.size;
            const index = wishlist.findIndex(item => item.productId === productId && item.size === size);
            if (index > -1) {
                wishlist.splice(index, 1);
                saveWishlist();
                renderWishlist();
                showToastMessage('Removed from Wishlist');
            }
        });
    });
}
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}" data-size="${item.size || 'One Size'}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-size">Size: ${item.size || 'One Size'}</p>
                <p class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                <div class="cart-item-qty">
                    <button class="qty-btn qty-minus" data-id="${item.id}" data-size="${item.size || 'One Size'}">&minus;</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn qty-plus" data-id="${item.id}" data-size="${item.size || 'One Size'}">&plus;</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}" data-size="${item.size || 'One Size'}">&times;</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    document.getElementById('cart-badge').textContent = totalItems;
    
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            removeFromCart(parseInt(btn.dataset.id), btn.dataset.size);
        });
    });
    
    document.querySelectorAll('.qty-minus').forEach(btn => {
        btn.addEventListener('click', () => {
            updateQuantity(parseInt(btn.dataset.id), btn.dataset.size, -1);
        });
    });
    
    document.querySelectorAll('.qty-plus').forEach(btn => {
        btn.addEventListener('click', () => {
            updateQuantity(parseInt(btn.dataset.id), btn.dataset.size, 1);
        });
    });
}

function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.id === productId && (item.size || 'One Size') === size));
    saveCart();
    updateCartUI();
}

function updateQuantity(productId, size, change) {
    const item = cart.find(item => item.id === productId && (item.size || 'One Size') === size);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId, size);
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
    
    const sizesContainer = document.querySelector('.size-options');
    if (product.sizes && product.sizes.length > 0) {
        sizesContainer.innerHTML = product.sizes.map(sizeItem => {
            const isOutOfStock = sizeItem.stock === 0;
            return `<button class="size-btn ${isOutOfStock ? 'out-of-stock' : ''}" 
                           data-size="${sizeItem.size}" 
                            data-stock="${sizeItem.stock}"
                            ${isOutOfStock ? 'disabled' : ''}>
                         ${sizeItem.size}
                         ${isOutOfStock ? '<span class="stock-zero">Out</span>' : ''}
                    </button>`;
        }).join('');
    } else {
        sizesContainer.innerHTML = `
            <button class="size-btn selected" data-size="One Size" data-stock="1">One Size</button>
        `;
    }
    
    const { inStock } = checkProductStock(productId, selectedSize);
    const wishlistBtn = document.getElementById('modal-wishlist');
    const currentSize = selectedSize || 'One Size';
    const inWishlist = isInWishlist(productId, currentSize);
    
    if (inWishlist) {
        wishlistBtn.classList.add('active');
        wishlistBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Remove from Wishlist
        `;
    } else if (!inStock) {
        wishlistBtn.classList.remove('active');
        wishlistBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            Notify When Available
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
    const size = selectedSize || 'One Size';
    const { inStock } = checkProductStock(productId, size);
    
    const existingIndex = wishlist.findIndex(item => item.productId === productId && item.size === size);
    
    if (existingIndex > -1) {
        wishlist.splice(existingIndex, 1);
        saveWishlist();
        showToastMessage('Removed from Wishlist');
    } else {
        wishlist.push({
            productId: productId,
            size: size,
            addedAt: new Date().toISOString()
        });
        saveWishlist();
        
        if (!inStock) {
            showStockNotification(productId, size);
            showToastMessage('We\'ll notify you when it\'s back in stock!');
        } else {
            showToastMessage('Added to Wishlist!');
        }
    }
    
    openProductModal(productId);
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

    document.getElementById('wishlist-btn').addEventListener('click', () => {
        renderWishlist();
        document.getElementById('wishlist-sidebar').classList.add('open');
    });

    document.getElementById('close-wishlist').addEventListener('click', () => {
        document.getElementById('wishlist-sidebar').classList.remove('open');
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
            if (btn.disabled) return;
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
            
            if (currentModalProduct) {
                const { inStock } = checkProductStock(currentModalProduct.id, selectedSize);
                const wishlistBtn = document.getElementById('modal-wishlist');
                const currentSize = selectedSize || 'One Size';
                const inWishlist = isInWishlist(currentModalProduct.id, currentSize);
                
                if (inWishlist) {
                    wishlistBtn.classList.add('active');
                    wishlistBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        Remove from Wishlist
                    `;
                } else if (!inStock) {
                    wishlistBtn.classList.remove('active');
                    wishlistBtn.innerHTML = `
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        Notify When Available
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
            }
        });
    });
    
    document.getElementById('modal-add-to-cart').addEventListener('click', () => {
        if (currentModalProduct) {
            const hasSizes = currentModalProduct.sizes && currentModalProduct.sizes.length > 0;
            if (hasSizes && !selectedSize) {
                showToastMessage('Please select a size');
                return;
            }
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

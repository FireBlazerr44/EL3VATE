let cart = [];
let discount = 0;
let promoApplied = false;

function init() {
    loadCart();
    renderCheckout();
    setupEventListeners();
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function renderCheckout() {
    const itemsContainer = document.getElementById('checkout-items');
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="checkout-empty">Your cart is empty</p>';
        document.getElementById('checkout-subtotal').textContent = '$0.00';
        document.getElementById('checkout-total').textContent = '$0.00';
        return;
    }
    
    itemsContainer.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
            <div class="checkout-item-details">
                <h4>${item.name}</h4>
                <p>Qty: ${item.quantity}</p>
            </div>
            <p class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    `).join('');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    discount = promoApplied ? subtotal * 0.10 : 0;
    const total = subtotal - discount;
    
    document.getElementById('checkout-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('checkout-discount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('checkout-discount').closest('.checkout-row').style.display = promoApplied ? 'flex' : 'none';
    document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
}

function setupEventListeners() {
    document.getElementById('checkout-form').addEventListener('submit', (e) => {
        e.preventDefault();
        placeOrder();
    });
    
    document.getElementById('card-number').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    });
    
    document.getElementById('expiry').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '$1/$2');
    });
    
    document.getElementById('cvv').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    document.getElementById('apply-promo').addEventListener('click', () => {
        const promoInput = document.getElementById('promo-code').value.trim().toUpperCase();
        const promoMessage = document.getElementById('promo-message');
        
        if (promoInput === 'ELEVATEYOURGAME') {
            promoApplied = true;
            promoMessage.textContent = '✓ Code applied! 10% discount';
            promoMessage.className = 'promo-message success';
            renderCheckout();
        } else if (promoInput === '') {
            promoMessage.textContent = 'Please enter a promo code';
            promoMessage.className = 'promo-message error';
        } else {
            promoMessage.textContent = 'Invalid promo code';
            promoMessage.className = 'promo-message error';
        }
    });
}

function placeOrder() {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal - (promoApplied ? subtotal * 0.10 : 0);
    
    const order = {
        id: Date.now(),
        items: [...cart],
        total: total,
        discount: promoApplied ? subtotal * 0.10 : 0,
        promoCode: promoApplied ? 'ELEVATEYOURGAME' : null,
        date: new Date().toISOString(),
        status: 'Processing'
    };
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    localStorage.removeItem('cart');
    
    showToast('Order placed successfully!');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);

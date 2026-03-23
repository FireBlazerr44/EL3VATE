let adminProducts = [];
let editingProductId = null;
let deleteProductId = null;

function init() {
    checkAdminAuth();
    loadAdminProducts();
    renderProducts();
    updateStats();
    setupEventListeners();
}

function checkAdminAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }
}

function loadAdminProducts() {
    const stored = localStorage.getItem('adminProducts');
    adminProducts = stored ? JSON.parse(stored) : [];
}

function saveAdminProducts() {
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
}

function getAllProducts() {
    return [...products, ...adminProducts];
}

function getNextProductId() {
    const allProducts = getAllProducts();
    if (allProducts.length === 0) return 1;
    return Math.max(...allProducts.map(p => p.id)) + 1;
}

function renderProducts(filter = '', category = 'all') {
    const tbody = document.getElementById('admin-products-tbody');
    let allProducts = getAllProducts();

    if (category !== 'all') {
        allProducts = allProducts.filter(p => p.category === category);
    }

    if (filter) {
        const searchTerm = filter.toLowerCase();
        allProducts = allProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
    }

    if (allProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="admin-empty-state">
                    No products found. Add your first product!
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = allProducts.map(product => {
        const isAdminProduct = product.id > 16;
        return `
            <tr data-id="${product.id}">
                <td>
                    <div class="admin-product-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/50'">
                    </div>
                </td>
                <td>
                    <div class="admin-product-name">
                        ${product.name}
                        ${isAdminProduct ? '<span class="admin-badge">Admin</span>' : ''}
                    </div>
                </td>
                <td>
                    <span class="admin-category-badge">${product.category}</span>
                </td>
                <td>$${product.price.toFixed(2)}</td>
                <td>
                    <span class="admin-new-badge ${product.new ? 'active' : ''}">${product.new ? 'NEW' : '-'}</span>
                </td>
                <td>
                    <div class="admin-action-buttons">
                        ${isAdminProduct ? `
                            <button class="admin-action-btn edit-btn" data-id="${product.id}" title="Edit">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="admin-action-btn delete-btn" data-id="${product.id}" title="Delete">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        ` : '<span class="admin-default-text">Built-in</span>'}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => showDeleteModal(parseInt(btn.dataset.id)));
    });
}

function updateStats() {
    const allProducts = getAllProducts();
    document.getElementById('total-products').textContent = allProducts.length;
    document.getElementById('admin-products-count').textContent = adminProducts.length;
    document.getElementById('shoes-count').textContent = allProducts.filter(p => p.category === 'shoes').length;
    document.getElementById('clothing-count').textContent = allProducts.filter(p => p.category === 'clothing').length;
}

function showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const targetBtn = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
}

function validateProduct(name, category, price, image, description) {
    if (!name || name.trim().length === 0) {
        return { valid: false, message: 'Product name is required' };
    }
    if (!category || category.trim().length === 0) {
        return { valid: false, message: 'Category is required' };
    }
    if (!price || parseFloat(price) <= 0) {
        return { valid: false, message: 'Price must be greater than 0' };
    }
    if (!image || image.trim().length === 0) {
        return { valid: false, message: 'Image URL is required' };
    }
    if (!description || description.trim().length === 0) {
        return { valid: false, message: 'Description is required' };
    }
    if (!image.startsWith('http')) {
        return { valid: false, message: 'Image URL must start with http:// or https://' };
    }
    return { valid: true };
}

function addProduct(productData) {
    const duplicate = adminProducts.find(p => p.name.toLowerCase() === productData.name.toLowerCase());
    if (duplicate) {
        return { success: false, message: 'A product with this name already exists' };
    }

    const newProduct = {
        id: getNextProductId(),
        ...productData
    };

    adminProducts.push(newProduct);
    saveAdminProducts();
    return { success: true, message: 'Product added successfully!' };
}

function updateProduct(id, productData) {
    const index = adminProducts.findIndex(p => p.id === id);
    if (index === -1) {
        return { success: false, message: 'Product not found' };
    }

    const duplicate = adminProducts.find(p => p.id !== id && p.name.toLowerCase() === productData.name.toLowerCase());
    if (duplicate) {
        return { success: false, message: 'A product with this name already exists' };
    }

    adminProducts[index] = { ...adminProducts[index], ...productData };
    saveAdminProducts();
    return { success: true, message: 'Product updated successfully!' };
}

function deleteProduct(id) {
    const index = adminProducts.findIndex(p => p.id === id);
    if (index === -1) {
        return { success: false, message: 'Product not found' };
    }

    adminProducts.splice(index, 1);
    saveAdminProducts();
    return { success: true, message: 'Product deleted successfully!' };
}

function editProduct(id) {
    const product = adminProducts.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    document.getElementById('product-id').value = id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-new').checked = product.new;

    document.getElementById('form-title').textContent = 'Edit Product';
    document.getElementById('submit-btn').textContent = 'Update Product';
    document.getElementById('cancel-edit-btn').style.display = 'inline-block';

    showSection('add-product');
}

function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    editingProductId = null;
    document.getElementById('form-title').textContent = 'Add New Product';
    document.getElementById('submit-btn').textContent = 'Add Product';
    document.getElementById('cancel-edit-btn').style.display = 'none';
    document.getElementById('form-message').textContent = '';
    document.getElementById('form-message').className = 'admin-form-message';
}

function showDeleteModal(id) {
    deleteProductId = id;
    document.getElementById('delete-modal').classList.add('active');
}

function hideDeleteModal() {
    deleteProductId = null;
    document.getElementById('delete-modal').classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('admin-toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function setupEventListeners() {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            showSection(section);
            if (section !== 'add-product') {
                resetForm();
            }
        });
    });

    document.getElementById('admin-search').addEventListener('input', (e) => {
        const filter = e.target.value;
        const category = document.getElementById('admin-category-filter').value;
        renderProducts(filter, category);
    });

    document.getElementById('admin-category-filter').addEventListener('change', (e) => {
        const category = e.target.value;
        const filter = document.getElementById('admin-search').value;
        renderProducts(filter, category);
    });

    document.getElementById('product-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('product-name').value.trim();
        const category = document.getElementById('product-category').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value.trim();
        const description = document.getElementById('product-description').value.trim();
        const isNew = document.getElementById('product-new').checked;

        const validation = validateProduct(name, category, price, image, description);
        if (!validation.valid) {
            const formMessage = document.getElementById('form-message');
            formMessage.textContent = validation.message;
            formMessage.className = 'admin-form-message error';
            return;
        }

        const productData = { name, category, price, image, description, new: isNew };
        let result;

        if (editingProductId) {
            result = updateProduct(editingProductId, productData);
        } else {
            result = addProduct(productData);
        }

        const formMessage = document.getElementById('form-message');
        if (result.success) {
            formMessage.textContent = result.message;
            formMessage.className = 'admin-form-message success';
            showToast(result.message);
            renderProducts();
            updateStats();
            setTimeout(() => {
                resetForm();
                showSection('products');
            }, 1500);
        } else {
            formMessage.textContent = result.message;
            formMessage.className = 'admin-form-message error';
        }
    });

    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        resetForm();
        showSection('products');
    });

    document.getElementById('cancel-delete-btn').addEventListener('click', hideDeleteModal);

    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
        if (deleteProductId) {
            const result = deleteProduct(deleteProductId);
            if (result.success) {
                showToast(result.message);
                renderProducts();
                updateStats();
            } else {
                showToast(result.message, 'error');
            }
            hideDeleteModal();
        }
    });

    document.getElementById('delete-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('delete-modal')) {
            hideDeleteModal();
        }
    });

    document.getElementById('admin-logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    });
}

document.addEventListener('DOMContentLoaded', init);

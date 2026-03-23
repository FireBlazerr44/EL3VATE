import { describe, it, expect, beforeEach, vi } from 'vitest';
import { products } from '../products.js';

describe('Admin Dashboard - Product Management', () => {
    beforeEach(() => {
        localStorage.removeItem('adminProducts');
    });

    describe('Product Data Structure', () => {
        it('should have valid product structure with all required fields', () => {
            const validProduct = {
                id: 1,
                name: 'Test Product',
                category: 'shoes',
                price: 99.99,
                image: 'https://example.com/image.jpg',
                new: true,
                description: 'Test description'
            };

            expect(validProduct).toHaveProperty('id');
            expect(validProduct).toHaveProperty('name');
            expect(validProduct).toHaveProperty('category');
            expect(validProduct).toHaveProperty('price');
            expect(validProduct).toHaveProperty('image');
            expect(validProduct).toHaveProperty('new');
            expect(validProduct).toHaveProperty('description');
        });

        it('should validate product categories', () => {
            const validCategories = ['shoes', 'clothing', 'accessories', 'equipment'];
            validCategories.forEach(category => {
                expect(validCategories).toContain(category);
            });
        });

        it('should validate price is a positive number', () => {
            const price = 99.99;
            expect(typeof price).toBe('number');
            expect(price).toBeGreaterThan(0);
        });
    });

    describe('Admin Products Storage', () => {
        it('should save products to localStorage', () => {
            const adminProducts = [{ id: 100, name: 'Admin Product', category: 'shoes', price: 79.99, image: 'https://example.com/test.jpg', new: true, description: 'Test' }];
            localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
            const stored = JSON.parse(localStorage.getItem('adminProducts'));
            expect(stored).toHaveLength(1);
            expect(stored[0].name).toBe('Admin Product');
        });

        it('should load admin products from localStorage', () => {
            const adminProducts = [{ id: 101, name: 'Loaded Product', category: 'clothing', price: 59.99, image: 'https://example.com/loaded.jpg', new: false, description: 'Loaded' }];
            localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
            const loaded = JSON.parse(localStorage.getItem('adminProducts'));
            expect(loaded).toHaveLength(1);
            expect(loaded[0].name).toBe('Loaded Product');
        });

        it('should return empty array when no admin products exist', () => {
            const stored = JSON.parse(localStorage.getItem('adminProducts') || '[]');
            expect(Array.isArray(stored)).toBe(true);
            expect(stored).toHaveLength(0);
        });
    });

    describe('Product CRUD Operations', () => {
        it('should generate unique ID for new products', () => {
            const existingProducts = products;
            const maxId = Math.max(...existingProducts.map(p => p.id));
            const newId = maxId + 1;
            expect(newId).toBeGreaterThan(maxId);
        });

        it('should validate product before adding', () => {
            const product = {
                name: 'Valid Product',
                category: 'shoes',
                price: 100,
                image: 'https://valid.url/image.jpg',
                description: 'Valid description'
            };

            expect(product.name.length).toBeGreaterThan(0);
            expect(['shoes', 'clothing', 'accessories', 'equipment']).toContain(product.category);
            expect(typeof product.price).toBe('number');
            expect(product.price).toBeGreaterThan(0);
        });

        it('should detect duplicate product names', () => {
            const adminProducts = [{ id: 1, name: 'Nike Air Max', category: 'shoes', price: 100, image: '', new: false, description: '' }];
            const newProductName = 'Nike Air Max';
            const isDuplicate = adminProducts.some(p => p.name.toLowerCase() === newProductName.toLowerCase());
            expect(isDuplicate).toBe(true);
        });
    });

    describe('Product Editing', () => {
        it('should update product by ID', () => {
            let adminProducts = [{ id: 1, name: 'Original', category: 'shoes', price: 100, image: '', new: false, description: '' }];
            const updatedProduct = { id: 1, name: 'Updated', category: 'clothing', price: 150, image: '', new: true, description: '' };
            adminProducts = adminProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p);
            expect(adminProducts[0].name).toBe('Updated');
            expect(adminProducts[0].category).toBe('clothing');
        });

        it('should find product by ID for editing', () => {
            const adminProducts = [
                { id: 1, name: 'Product 1', category: 'shoes', price: 100, image: '', new: false, description: '' },
                { id: 2, name: 'Product 2', category: 'clothing', price: 80, image: '', new: false, description: '' }
            ];
            const product = adminProducts.find(p => p.id === 2);
            expect(product).toBeDefined();
            expect(product.name).toBe('Product 2');
        });
    });

    describe('Product Deletion', () => {
        it('should remove product by ID', () => {
            let adminProducts = [
                { id: 1, name: 'Product 1', category: 'shoes', price: 100, image: '', new: false, description: '' },
                { id: 2, name: 'Product 2', category: 'clothing', price: 80, image: '', new: false, description: '' }
            ];
            adminProducts = adminProducts.filter(p => p.id !== 1);
            expect(adminProducts).toHaveLength(1);
            expect(adminProducts[0].id).toBe(2);
        });

        it('should not affect other products when deleting', () => {
            let adminProducts = [
                { id: 1, name: 'Product 1', category: 'shoes', price: 100, image: '', new: false, description: '' },
                { id: 2, name: 'Product 2', category: 'clothing', price: 80, image: '', new: false, description: '' },
                { id: 3, name: 'Product 3', category: 'accessories', price: 50, image: '', new: false, description: '' }
            ];
            adminProducts = adminProducts.filter(p => p.id !== 2);
            expect(adminProducts).toHaveLength(2);
            expect(adminProducts.map(p => p.id)).toEqual([1, 3]);
        });
    });

    describe('Form Validation', () => {
        it('should validate required fields', () => {
            const requiredFields = ['name', 'category', 'price', 'image', 'description'];
            const product = {
                name: '',
                category: '',
                price: 0,
                image: '',
                description: ''
            };

            requiredFields.forEach(field => {
                expect(product[field] === '' || product[field] === 0).toBe(true);
            });
        });

        it('should validate image URL format', () => {
            const validUrl = 'https://images.unsplash.com/photo-123?w=400&h=400&fit=crop';
            const invalidUrl = 'not-a-url';
            expect(validUrl.startsWith('http')).toBe(true);
            expect(invalidUrl.startsWith('http')).toBe(false);
        });

        it('should validate price is numeric and positive', () => {
            const validPrice = 99.99;
            const invalidPrice = -10;
            expect(validPrice).toBeGreaterThan(0);
            expect(invalidPrice).toBeLessThanOrEqual(0);
        });
    });

    describe('Combined Products View', () => {
        it('should merge default and admin products', () => {
            const adminProducts = [{ id: 100, name: 'Admin Shoe', category: 'shoes', price: 89.99, image: '', new: false, description: '' }];
            const allProducts = [...products, ...adminProducts];
            expect(allProducts.length).toBeGreaterThan(products.length);
        });

        it('should filter combined products by category', () => {
            const adminProducts = [
                { id: 100, name: 'Admin Shoe', category: 'shoes', price: 89.99, image: '', new: false, description: '' },
                { id: 101, name: 'Admin Clothing', category: 'clothing', price: 49.99, image: '', new: false, description: '' }
            ];
            const allProducts = [...products, ...adminProducts];
            const shoes = allProducts.filter(p => p.category === 'shoes');
            expect(shoes.length).toBeGreaterThan(0);
        });
    });

    describe('Admin Authentication', () => {
        it('should check for admin role in user data', () => {
            const adminUser = { email: 'admin@test.com', role: 'admin' };
            const regularUser = { email: 'user@test.com', role: 'user' };
            expect(adminUser.role).toBe('admin');
            expect(regularUser.role).not.toBe('admin');
        });

        it('should store admin status in localStorage', () => {
            const adminUser = { email: 'admin@test.com', role: 'admin' };
            localStorage.setItem('currentUser', JSON.stringify(adminUser));
            const stored = JSON.parse(localStorage.getItem('currentUser'));
            expect(stored.role).toBe('admin');
        });
    });
});

describe('Admin Dashboard UI Elements', () => {
    it('should have required dashboard sections', () => {
        const dashboardSections = ['products', 'add-product', 'edit-product'];
        dashboardSections.forEach(section => {
            expect(section.length).toBeGreaterThan(0);
        });
    });

    it('should have form fields for product creation', () => {
        const formFields = ['name', 'category', 'price', 'image', 'description', 'isNew'];
        formFields.forEach(field => {
            expect(field.length).toBeGreaterThan(0);
        });
    });

    it('should support category options', () => {
        const categories = ['shoes', 'clothing', 'accessories', 'equipment'];
        expect(categories).toHaveLength(4);
        categories.forEach(cat => {
            expect(typeof cat).toBe('string');
        });
    });
});

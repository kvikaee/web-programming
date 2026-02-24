const products = [
    { 
        id: 1, 
        name: 'rüstung', 
        artist: 'shodnik',
        price: 17000,
        image: 'images/кар1.jpg'
    },
    { 
        id: 2, 
        name: 'schlangenbraut', 
        artist: 'shodnik',
        price: 15000,
        image: 'images/кар2.jpg'
    },
    { 
        id: 3, 
        name: 'einblick', 
        artist: 'shodnik',
        price: 7000,
        image: 'images/кар7.jpg'
    },
    { 
        id: 4, 
        name: 'sehnsucht', 
        artist: 'shodnik',
        price: 13000,
        image: 'images/кар8.jpg'
    },
    { 
        id: 5, 
        name: 'immer', 
        artist: 'shodnik',
        price: 9000,
        image: 'images/кар10.jpg'
    },
    { 
        id: 6, 
        name: 'blutiger ', 
        artist: 'shodnik',
        price: 17000,
        image: 'images/кар14.jpg'
    },
    { 
        id: 7, 
        name: '31.12', 
        artist: 'shodnik',
        price: 6000,
        image: 'images/кар17.jpg'
    },
];

// состояние корзины
let cart = [];

// DOM элементы
const productsGrid = document.getElementById('products-grid');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

// загрузка корзины из localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Ошибка загрузки корзины', e);
            cart = [];
        }
    } else {
        cart = [];
    }
}

// сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// добавление товара в корзину
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            artist: product.artist,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();
    renderCart();
}

// увеличение/уменьшение количества
function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
        removeFromCart(productId);
    } else {
        item.quantity = newQuantity;
        saveCart();
        renderCart();
    }
}

// удаление товара из корзины
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
}


// отрисовка каталога товаров
function renderProducts() {
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <h3>${product.name}</h3>
                <div class="artist">${product.artist}</div>
                <div class="price">${product.price.toLocaleString()} ₽</div>
                <button class="btn add-to-cart" data-id="${product.id}">В корзину</button>
            </div>
        `;
    });

    productsGrid.innerHTML = html;

    // навешиваем обработчики на кнопки "В корзину"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.dataset.id);
            addToCart(productId);
        });
    });
}

// отрисовка корзины
function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="color: #7e5a4b; text-align: center;">Корзина пуста</p>';
        cartTotal.textContent = '0';
        checkoutBtn.disabled = true;
        return;
    }

    checkoutBtn.disabled = false;

    let itemsHtml = '';
    cart.forEach(item => {
        itemsHtml += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-action="decr">−</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" data-action="incr">+</button>
                    <button class="remove-btn" data-action="remove" title="Удалить">✕</button>
                </div>
            </div>
        `;
    });

    cartItems.innerHTML = itemsHtml;

    // обработчики для кнопок управления в корзине
    cartItems.querySelectorAll('.cart-item').forEach(itemEl => {
        const productId = parseInt(itemEl.dataset.id);
        const decrBtn = itemEl.querySelector('[data-action="decr"]');
        const incrBtn = itemEl.querySelector('[data-action="incr"]');
        const removeBtn = itemEl.querySelector('[data-action="remove"]');

        decrBtn.addEventListener('click', () => updateQuantity(productId, -1));
        incrBtn.addEventListener('click', () => updateQuantity(productId, 1));
        removeBtn.addEventListener('click', () => removeFromCart(productId));
    });

    // подсчёт и отображение общей суммы
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.textContent = total.toLocaleString();
}

// модальное окно
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modal-close');
const orderForm = document.getElementById('order-form');

// функции открытия/закрытия модального окна
function openModal() {
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
    orderForm.reset(); // очистить поля формы при закрытии
}

// закрытие по клику на крестик
modalClose.addEventListener('click', closeModal);

// закрытие по клику вне модального окна (на фон)
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// обработка отправки формы 
orderForm.addEventListener('submit', (e) => {
    e.preventDefault(); // предотвращаем перезагрузку страницы

    alert('Заказ создан!');
    closeModal();

    // очистка корзины после заказа
    cart = [];
    saveCart();
    renderCart();
});

// привязка открытия модалки к кнопке "Оформить заказ"
// checkoutBtn уже объявлен ранее, просто добавляем обработчик
checkoutBtn.addEventListener('click', openModal);

// инициализация
loadCart();   
renderProducts();
renderCart();
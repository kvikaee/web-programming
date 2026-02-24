const products = [
    { 
        id: 1, 
        name: '111', 
        artist: 'shodnik',
        price: 10000,
        image: 'images\кар1.jpg'
    },
    { 
        id: 2, 
        name: '222', 
        artist: 'shodnik',
        price: 10000,
        image: 'images\кар2.jpg'
    },
];


function renderProducts() {
    // находим контейнер, куда будем вставлять карточки
    const container = document.getElementById('products-grid');

    // проходим по каждому товару и создаём для него HTML
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-card">
                <h3>${product.name}</h3>
                <p>Художник: ${product.artist}</p>
                <p>Цена: ${product.price} ₽</p>
                <button class="add-to-cart" data-id="${product.id}">В корзину</button>
            </div>
        `;
    });

    // вставляем полученную разметку в контейнер
    container.innerHTML = html;
}


renderProducts();
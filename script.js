document.addEventListener('DOMContentLoaded', () => {
  // product data (можна замінити або завантажити з API)
  const products = [
    {sku:'p1', name:'Класичне пальто', price:4500, img:'https://picsum.photos/seed/p1/600/800'},
    {sku:'p2', name:'Шкіряна куртка', price:5200, img:'https://picsum.photos/seed/p2/600/800'},
    {sku:'p3', name:'Шовкова блуза', price:2800, img:'https://picsum.photos/seed/p3/600/800'},
    {sku:'p4', name:'Вовняний светр', price:3200, img:'https://picsum.photos/seed/p4/600/800'},
    {sku:'p5', name:'Класичні брюки', price:2900, img:'https://picsum.photos/seed/p5/600/800'},
    {sku:'p6', name:'Шкіряна сумка', price:4800, img:'https://picsum.photos/seed/p6/600/800'},
    {sku:'p7', name:'Вінтажна сукня', price:5000, img:'https://picsum.photos/seed/p7/600/800'},
    {sku:'p8', name:'Кросівки ретро', price:2100, img:'https://picsum.photos/seed/p8/600/800'}
  ];

  const grid = document.querySelector('.product-grid');

  // render products
  products.forEach((p, idx) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img loading="lazy" src="${p.img}" alt="${p.name}">
        <div class="hover-overlay">
          <button class="add-to-cart" data-sku="${p.sku}" data-idx="${idx}">Додати в кошик</button>
        </div>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="price">${p.price} грн</div>
      </div>
    `;
    grid.appendChild(card);

    // initial anime entrance
    anime.timeline({delay: idx * 80})
      .add({
        targets: card,
        opacity: [0,1],
        translateY: [20,0],
        duration: 700,
        easing: 'easeOutQuad'
      });
  });

  // NAV animations
  const navItems = document.querySelectorAll('.nav-item');
  anime({
    targets: navItems,
    translateY: [-10,0],
    opacity: [0,1],
    delay: anime.stagger(80),
    easing: 'easeOutExpo',
    duration: 700
  });

  // Button hover animations (anime.js)
  document.body.addEventListener('pointerenter', e => {
    if (e.target.matches('.add-to-cart, .cta-button, .ghost-button')) {
      anime.remove(e.target);
      anime({
        targets: e.target,
        scale: 1.06,
        duration: 350,
        easing: 'spring(1, 80, 10, 0)'
      });
    }
  }, true);

  document.body.addEventListener('pointerleave', e => {
    if (e.target.matches('.add-to-cart, .cta-button, .ghost-button')) {
      anime.remove(e.target);
      anime({
        targets: e.target,
        scale: 1,
        duration: 350,
        easing: 'easeOutElastic(1, .8)'
      });
    }
  }, true);

  // reveal on scroll for product cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        anime({
          targets: entry.target,
          opacity: [0,1],
          translateY: [30,0],
          duration: 700,
          easing: 'easeOutExpo'
        });
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.15});

  document.querySelectorAll('.product-card').forEach(c => observer.observe(c));

  // CART: persistent with localStorage
  let cart = JSON.parse(localStorage.getItem('noir_cart') || '[]');
  const cartIcon = document.querySelector('.cart-icon');
  const cartModal = document.getElementById('cart-modal');
  const closeCart = document.querySelector('.close-cart');
  const cartItemsNode = document.getElementById('cart-items');
  const cartTotalNode = document.getElementById('cart-total');
  const cartCountNode = document.querySelector('.cart-count');
  const checkoutBtn = document.getElementById('checkout-btn');

  function saveCart(){ localStorage.setItem('noir_cart', JSON.stringify(cart)); }
  function formatPrice(n){ return Math.round(n); }

  function updateCartCount(){
    cartCountNode.textContent = cart.reduce((s,i)=>s + i.qty, 0);
  }

  function renderCart(){
    cartItemsNode.innerHTML = '';
    if (cart.length === 0) {
      cartItemsNode.innerHTML = '<p style="color:#666">Кошик порожній</p>';
      cartTotalNode.textContent = '0';
      return;
    }
    let sum = 0;
    cart.forEach(item => {
      sum += item.price * item.qty;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${formatPrice(item.price)} грн × ${item.qty}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div>
            <button class="small-btn dec" data-sku="${item.sku}">−</button>
            <button class="small-btn inc" data-sku="${item.sku}">+</button>
          </div>
          <button class="remove-item" data-sku="${item.sku}">&times;</button>
        </div>
      `;
      cartItemsNode.appendChild(div);
    });
    cartTotalNode.textContent = formatPrice(sum);
    attachCartButtons();
  }

  function attachCartButtons(){
    cartItemsNode.querySelectorAll('.remove-item').forEach(btn => {
      btn.onclick = () => {
        const sku = btn.dataset.sku;
        cart = cart.filter(i => i.sku !== sku);
        saveCart(); updateCartCount(); renderCart();
        toast('Товар видалено');
      };
    });
    cartItemsNode.querySelectorAll('.inc').forEach(btn=>{
      btn.onclick = () => {
        const sku = btn.dataset.sku;
        const it = cart.find(i=>i.sku===sku); if (it){ it.qty++; saveCart(); renderCart(); updateCartCount(); }
      };
    });
    cartItemsNode.querySelectorAll('.dec').forEach(btn=>{
      btn.onclick = () => {
        const sku = btn.dataset.sku;
        const it = cart.find(i=>i.sku===sku); if (it){ it.qty = Math.max(1, it.qty-1); saveCart(); renderCart(); updateCartCount(); }
      };
    });
  }

  function openCart(){
    cartModal.classList.add('show');
    cartModal.setAttribute('aria-hidden','false');
    renderCart();
    anime({
      targets: '.cart-panel',
      translateX: [80,0],
      opacity: [0,1],
      duration: 500,
      easing: 'easeOutCubic'
    });
  }
  function closeCartFn(){
    anime({
      targets: '.cart-panel',
      translateX: [0,80],
      opacity: [1,0],
      duration: 350,
      easing: 'easeInCubic',
      complete: ()=> { cartModal.classList.remove('show'); cartModal.setAttribute('aria-hidden','true'); }
    });
  }

  cartIcon.addEventListener('click', openCart);
  closeCart.addEventListener('click', closeCartFn);
  cartModal.addEventListener('click', e => { if (e.target === cartModal) closeCartFn(); });

  // delegate add-to-cart (buttons generated dynamically)
  document.body.addEventListener('click', e => {
    if (e.target.matches('.add-to-cart')) {
      const sku = e.target.dataset.sku;
      const idx = Number(e.target.dataset.idx);
      const prod = products[idx];
      if (!prod) return;
      const exists = cart.find(i=>i.sku===prod.sku);
      if (exists) exists.qty++;
      else cart.push({...prod, qty:1});
      saveCart(); updateCartCount(); toast('Додано в кошик');
      anime({
        targets: e.target,
        scale: [1,1.18,1],
        duration: 700,
        easing: 'easeOutElastic(1, .6)'
      });
    }
  });

  // checkout
  if (checkoutBtn){
    checkoutBtn.addEventListener('click', () => {
      if (cart.length===0){ toast('Кошик порожній'); return; }
      // імітація оформлення
      toast('Дякуємо! Ваше замовлення прийнято');
      cart = []; saveCart(); updateCartCount(); renderCart();
      setTimeout(()=> closeCartFn(), 700);
    });
  }

  // newsletter
  document.getElementById('newsletter')?.addEventListener('submit', e=>{
    e.preventDefault();
    toast('Підписка оформлена');
    e.target.reset();
  });

  // small helper toast
  function toast(msg){
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    container.appendChild(t);
    anime({
      targets: t,
      opacity: [0,1],
      translateY: [-10,0],
      duration: 420,
      easing: 'easeOutCubic'
    });
    setTimeout(()=> anime({
      targets: t,
      opacity: [1,0],
      translateY: [0,-8],
      duration: 420,
      easing: 'easeInQuad',
      complete: ()=> t.remove()
    }), 2600);
  }
});
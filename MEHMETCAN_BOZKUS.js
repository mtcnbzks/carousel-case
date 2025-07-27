(() => {
  const HOMEPAGE_REGEX = /^\/(?:$|\?)/; // only "/"
  const PRODUCTS_API =
    "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";
  const LS_KEY_DATA = "products";
  const LS_KEY_FAV = "favorites";

  const getJSON = (k) => {
    try {
      return JSON.parse(localStorage.getItem(k) || "null");
    } catch {
      return null;
    }
  };

  const setJSON = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  // Load product data from localStorage or API
  async function loadProducts() {
    let list = getJSON(LS_KEY_DATA);
    if (list) return list;

    try {
      const res = await fetch(PRODUCTS_API);
      list = await res.json();

      // Add mock stars/reviews so UI looks complete (not in real payload)
      list.forEach((p) => {
        p.rating = +(Math.random() * 1.5 + 3.5).toFixed(1); // 3.5-5.0
        p.reviewCount = Math.floor(Math.random() * 400) + 10;
      });

      setJSON(LS_KEY_DATA, list);
      return list;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  function buildHTML(products) {
    if (document.querySelector("#eb-carousel")) return; // avoid duplicates

    const wrap = document.createElement("section");
    wrap.id = "eb-carousel";
    wrap.className = "eb-carousel";
    wrap.innerHTML = `
      <div class="eb-title">
        <span>Beğenebileceğinizi düşündüklerimiz</span>
      </div>
      <div class="eb-viewport">
        <button class="eb-nav prev" aria-label="Önceki"><span>&#10094;</span></button>
        <div class="eb-track"></div>
        <button class="eb-nav next" aria-label="Sonraki"><span>&#10095;</span></button>
      </div>`;

    // Insert carousel into the page
    const mainContent = document.querySelector("main") || document.body;
    mainContent.insertBefore(wrap, mainContent.firstChild);

    const track = wrap.querySelector(".eb-track");
    const favs = new Set((getJSON(LS_KEY_FAV) || []).map(String));
    const money = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    });

    // Add product cards to track
    products.forEach((p) => track.appendChild(renderCard(p)));

    // Card template renderer
    function renderCard(p) {
      const card = document.createElement("div");
      card.className = "eb-card";
      card.dataset.id = p.id;
      card.dataset.url = p.url;
      const favOn = favs.has(String(p.id));
      const disc = +p.original_price > +p.price;
      const pct = disc
        ? Math.round(100 - (p.price / p.original_price) * 100)
        : 0;
      const starW = (p.rating / 5) * 100;

      card.innerHTML = `
        <div class="eb-imgWrap">
          <img src="${p.img}" alt="${p.name}">
          <button class="eb-fav ${favOn ? "on" : ""}" aria-label="Favori">
            <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4
              8.24 4 9.91 5.01 10.63 6.54h.74C13.09 5.01 14.76 4 16.5 4
              19 4 21 6 21 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
        <div class="eb-body">
          <h3 class="eb-name"><b>${p.brand} -</b> ${p.name}</h3>
          <div class="eb-reviews">
            <div class="stars-o"><div class="stars-i" style="width:${starW}%"></div></div>
            <span class="cnt">(${p.reviewCount})</span>
          </div>
          <div class="eb-prices ${disc ? "has-discount" : ""}">
            <div class="line">
              ${
                disc
                  ? `<span class="old">${money.format(p.original_price)}</span>`
                  : ""
              }
              ${disc ? `<span class="pct">%${pct}</span>` : ""}
            </div>
            <span class="new">${money.format(p.price)}</span>
          </div>
          <button class="eb-cart">Sepete Ekle</button>
        </div>`;

      return card;
    }

    return wrap;
  }

  function buildCSS() {
    if (document.getElementById("eb-carousel-style")) return;

    const css = `
    /* Font imports */
    @font-face{font-family:'Poppins';font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLDz8Z1xlFd2JQEk.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
    @font-face{font-family:'Poppins';font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/poppins/v23/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
    @font-face{font-family:'Poppins';font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
    @font-face{font-family:'Poppins';font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
    @font-face{font-family:'Poppins';font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/poppins/v23/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2) format('woff2');unicode-range:U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;}
    
    /* Carousel container */
    .eb-carousel {
      margin: 32px auto;
      font-family: "Open Sans", sans-serif;
      max-width: 1200px;
      background-color: #fff5e7;
      border-top-left-radius: 35px;
      border-top-right-radius: 35px;
    }
    
    /* Title section */
    .eb-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 25px 67px;
      font-family: Quicksand-Bold, sans-serif;
      font-weight: 700;
      font-size: 24px;
      color: #f28e00;
    }
    .eb-title .eb-see-all {
      font-size: 14px;
      color: #f28e00;
      text-decoration: none;
      font-weight: 600;
    }
    .eb-title .eb-see-all .arrow {
      margin-left: 4px;
      font-size: 20px;
    }
    
    /* Carousel viewport */
    .eb-viewport {
      position: relative;
      background-color: #fff;
      padding: 16px 0;
    }
    .eb-track {
      display: flex;
      gap: 16px;
      overflow: hidden;
      scroll-behavior: smooth;
      padding: 4px 16px;
    }
    
    /* Card styling */
    .eb-card {
      flex: 0 0 calc(25% - 12px);
      background: #fff;
      border: 1px solid #f0efef;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      transition: box-shadow .2s;
      cursor: pointer;
    }
    .eb-card:hover {
      box-shadow: 0 4px 20px rgba(0, 0, 0, .08);
    }
    .eb-card:hover .eb-imgWrap {
      cursor: pointer;
    }
    .eb-imgWrap {
      position: relative;
      padding: 12px 12px 0;
    }
    .eb-imgWrap img {
      width: 100%;
      aspect-ratio: 1/1;
      object-fit: contain;
    }
    
    /* Favorite button */
    .eb-fav {
      position: absolute;
      top: 16px;
      right: 16px;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 50%;
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .eb-fav svg {
      width: 22px;
      height: 22px;
      color: #f28e00;
      fill: none;
      stroke: #f28e00;
      stroke-width: 1px;
    }
    .eb-fav.on svg {
      fill: #f28e00;
      color: #f28e00;
    }
    
    /* Card body */
    .eb-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      position: relative;
      padding-bottom: 80px;
    }
    .eb-name {
      font-size: 14px;
      font-weight: 400;
      margin: 0 0 8px;
      min-height: 40px;
      color: #000;
    }
    .eb-name b {
      font-weight: 600;
      color: #000;
    }
    
    /* Reviews and stars */
    .eb-reviews {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 12px;
    }
    .stars-o {
      position: relative;
      font-size: 0;
    }
    .stars-o::before, .stars-i::before {
      content: '★★★★★';
      font-size: 16px;
      color: #ddd;
      letter-spacing: 4px;
    }
    .stars-i {
      position: absolute;
      left: 0;
      top: 0;
      overflow: hidden;
    }
    .stars-i::before {
      color: #ffc107;
    }
    .cnt {
      font-size: 12px;
      color: #999;
    }
    
    /* Pricing */
    .eb-prices {
      margin-bottom: 12px;
    }
    .eb-prices .line {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .old {
      font-size: 14px;
      text-decoration: line-through;
      color: #999;
    }
    .pct {
      font-size: 13px;
      font-weight: 600;
      color: #2e8b57;
    }
    .new {
      font-size: 20px;
      font-weight: 700;
      color: #777;
    }
    .eb-prices.has-discount .new {
      color: #2e8b57;
    }
    
    /* Add to cart button */
    .eb-cart {
      display: inline-block;
      width: 100%;
      position: absolute;
      z-index: 2;
      bottom: 12px;
      left: 0;
      right: 0;
      background-color: #fff7ec;
      border: 1px solid transparent;
      border-radius: 37.5px;
      padding: 15px 20px;
      font-family: 'Poppins', "cursive";
      font-size: 1.1rem;
      font-weight: 700;
      color: #f28e00;
      cursor: pointer;
      height: 48px;
      max-height: 48px;
      min-width: 48px;
      text-align: center;
      vertical-align: middle;
      line-height: 1.2;
      transition: color .15s ease-in-out, background-color .15s ease-in-out,
                 border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      -webkit-user-select: none;
      user-select: none;
      overflow: visible;
      text-transform: none;
      -webkit-appearance: button;
      box-sizing: border-box;
      border: none;
      margin: 0 12px;
      width: calc(100% - 24px);
    }
    .eb-cart:hover {
      background-color: #f28e00;
      color: #fff;
      text-decoration: none;
    }
    .eb-cart:focus {
      outline: 0;
      box-shadow: 0 0 0 .2rem #fe575740;
    }
    .eb-cart:disabled {
      opacity: .65;
    }
    
    /* Navigation arrows */
    .eb-nav {
      position: absolute;
      top: 40%;
      transform: translateY(-50%);
      background: #fff;
      border: 1px solid #e0e0e0;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0, 0, 0, .07);
      transition: .2s;
    }
    .eb-nav span {
      font-size: 22px;
      color: #bf6a0a;
    }
    .eb-nav:hover {
      background: #f28e00;
      border-color: #f28e00;
    }
    .eb-nav:hover span {
      color: #fff;
    }
    .eb-nav.prev {
      left: -25px;
    }
    .eb-nav.next {
      right: -25px;
    }
    
    /* Responsive styles */
    @media (max-width: 1250px) {
      .eb-nav {
        display: none;
      }
    }
    @media (max-width: 1023px) {
      .eb-card {
        flex-basis: calc(33.333% - 12px);
      }
    }
    @media (max-width: 767px) {
      .eb-card {
        flex-basis: calc(50% - 12px);
      }
      .eb-title {
        padding: 20px;
        font-size: 20px;
      }
      .eb-cart {
        padding: 10px;
        font-size: 1rem;
      }
    }
    @media (max-width: 479px) {
      .eb-track {
        gap: 12px;
      }
      .eb-card {
        flex-basis: 80%;
      }
      .eb-title {
        padding: 15px;
        font-size: 18px;
      }
      .eb-title .eb-see-all {
        font-size: 12px;
      }
      .eb-cart {
        padding: 5px;
        font-size: 0.9rem;
      }
    }
    @media (max-width: 320px) {
      .eb-cart {
        padding: 5px;
      }
    }`;

    const style = document.createElement("style");
    style.id = "eb-carousel-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  function setEvents(carouselElement) {
    if (!carouselElement) return;

    const track = carouselElement.querySelector(".eb-track");
    const favs = new Set((getJSON(LS_KEY_FAV) || []).map(String));

    // Navigation handlers
    const gap = 16;
    const cardW = () =>
      track.querySelector(".eb-card")?.getBoundingClientRect().width || 0;

    carouselElement.querySelector(".prev").onclick = () =>
      track.scrollBy({
        left: -(cardW() + gap),
        behavior: "smooth",
      });

    carouselElement.querySelector(".next").onclick = () =>
      track.scrollBy({
        left: cardW() + gap,
        behavior: "smooth",
      });

    const cards = track.querySelectorAll(".eb-card");
    cards.forEach((card) => {
      card.onclick = (e) => {
        if (e.target.closest(".eb-fav,.eb-cart")) return;
        const productUrl = e.currentTarget.dataset.url;
        if (productUrl) window.open(productUrl, "_blank");
      };

      // Favorite toggle
      const favBtn = card.querySelector(".eb-fav");
      const productId = card.dataset.id;

      if (favBtn && productId) {
        favBtn.onclick = (e) => {
          e.stopPropagation();
          const b = e.currentTarget;
          b.classList.toggle("on");
          if (b.classList.contains("on")) {
            favs.add(productId);
          } else {
            favs.delete(productId);
          }
          setJSON(LS_KEY_FAV, [...favs]);
        };
      }

      const cartBtn = card.querySelector(".eb-cart");
      if (cartBtn) {
        cartBtn.onclick = (e) => {
          e.stopPropagation();
          alert("Ürün sepete eklendi!");
        };
      }
    });
  }

  async function init() {
    // Exit if not on homepage
    if (!HOMEPAGE_REGEX.test(location.pathname)) {
      console.log("wrong page");
      return;
    }

    const products = await loadProducts();
    if (!products || products.length === 0) {
      console.log("No products to display.");
      return;
    }

    buildCSS();

    const carousel = buildHTML(products);

    setEvents(carousel);
  }

  init();
})();

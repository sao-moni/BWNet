let productList = [
    {
        id:101,
        cat: "Accessories",
        title: "Wireless Mouse",
        price: 12.50,
        stock: 20,
        imgPath:""
    },
    {
        id:102,
        cat: "Accessories",
        title: "Mechanical Keyboard",
        price: 24.00,
        stock: 15,
        imgPath:""

    },
    {        
        id:103,
        cat: "Storage",
        title: "USB Flash 64GB",
        price: 8.75,
        stock: 30,
        imgPath:""

    },
    {
        id:104,
        cat: "Storage",
        title: "SSD 1TB NVMe",
        price: 99,
        stock: 10,
        imgPath:""
    },
    {
        id:105,
        cat: "Audio",
        title: "Gaming Headset",
        price: 35.50,
        stock: 8,
        imgPath:""

    },
    {
        id:106,
        cat: "Accessories",
        title: "HD Webcam",
        price: 12.50,
        stock: 12,
        imgPath:""

    },
    {
        id:107,
        cat: "Display",
        title: "24-inch Monitor",
        price: 149.00,
        stock: 5,
        imgPath:""

    },
    {
        id:108,
        cat: "Laptop",
        title: "Laptop Core i5",
        price: 549.00,
        stock: 3,
        imgPath:""

    }
]
let inCartList = []
let discount = 0          
const vet = 0.10
const KHR_RATE = 4000
const DELIVERY = { pp: 1.50, province: 3.00 }
const FREE_DELIVERY_FROM = 100
const COUPONS = { SAVE10: 0.10 }
const $ = (id) => document.getElementById(id)
const usd = (n) => '$' + n.toFixed(2)
const esc = (str) => str.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]))
const khr = (n) => Math.round(n * KHR_RATE).toLocaleString() + ' ៛'

const cartToast = new bootstrap.Toast($('cartToast'), { delay: 1800 })
function toast(msg) {
  $('toastMessage').textContent = msg
  cartToast.show()
}

document.querySelectorAll('[data-add]').forEach((button) => {
  button.addEventListener('click', function () {
    const card = this.closest('.product-card')
    const productTitle = card.querySelector('.card-title').textContent.trim()
    const product = productList.find((p) => p.title === productTitle)
    if (!product) return

    const item = inCartList.find((c) => c.cartID === product.id)
    if (item) {
      if (item.qcart >= product.stock) return toast(`Only ${product.stock} ${product.title} in stock`)
      item.qcart += 1
    } else {
      inCartList.push({
        cartID: product.id,
        cartTitle: product.title,
        cartCat: product.cat,
        cartPrice: product.price,
        cartImg: card.querySelector('.product-img').getAttribute('src'),
        stock: product.stock,
        qcart: 1
      })
    }
    toast(`${product.title} added to cart`)
    renderCart()
  })
})

function getTotals() {
  const subtotal = inCartList.reduce((sum, c) => sum + c.cartPrice * c.qcart, 0)
  const discountAmt = subtotal * discount
  const vat = (subtotal - discountAmt) * vet
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY[$('deliverySelect').value]
  const total = subtotal - discountAmt + vat + delivery
  return { subtotal, discountAmt, vat, delivery, total }
}

function renderCart() {
  const list = $('cartItems')
  const count = inCartList.reduce((n, c) => n + c.qcart, 0)

  $('cartBadge').textContent = count
  $('cartBadge').dataset.count = count
  $('checkoutBtn').disabled = count === 0
  $('clearCartBtn').disabled = count === 0

  if (count === 0) {
    list.innerHTML = `<li class="list-group-item text-center text-muted py-5 border-0">
        <i class="bi bi-cart3 fs-1 d-block mb-2"></i>Your cart is empty</li>`
  } else {
    list.innerHTML = inCartList.map((c) => `
      <li class="list-group-item cart-item d-flex align-items-center px-0">
        <img src="${c.cartImg}" alt="" width="56" height="56" class="border bg-white p-1" style="object-fit:contain">
        <div class="flex-grow-1 min-w-0">
          <div class="fw-semibold text-truncate">${c.cartTitle}</div>
          <small class="text-muted">${usd(c.cartPrice)} each</small>
          <div class="d-flex align-items-center gap-2 mt-1">
            <button class="btn btn-outline-secondary btn-sm qty-btn" data-qty="-1" data-id="${c.cartID}" aria-label="Decrease">−</button>
            <span class="fw-semibold">${c.qcart}</span>
            <button class="btn btn-outline-secondary btn-sm qty-btn" data-qty="1" data-id="${c.cartID}" aria-label="Increase">+</button>
          </div>
        </div>
        <div class="text-end">
          <div class="fw-bold">${usd(c.cartPrice * c.qcart)}</div>
          <button class="btn btn-link btn-sm text-danger p-0" data-remove="${c.cartID}"><i class="bi bi-trash3"></i></button>
        </div>
      </li>`).join('')
  }

  const t = getTotals()
  $('subprice').textContent = usd(t.subtotal)
  $('discountAmt').textContent = '−' + usd(t.discountAmt)
  $('vet').textContent = usd(t.vat)
  $('deliveryAmt').textContent = t.subtotal >= FREE_DELIVERY_FROM ? 'Free' : usd(t.delivery)
  $('totalUSD').textContent = usd(t.total)
  $('totalKHR').textContent = khr(t.total)
}

$('cartItems').addEventListener('click', (e) => {
  const qtyBtn = e.target.closest('[data-qty]')
  const removeBtn = e.target.closest('[data-remove]')
  if (qtyBtn) {
    const item = inCartList.find((c) => c.cartID == qtyBtn.dataset.id)
    item.qcart = Math.min(item.stock, item.qcart + Number(qtyBtn.dataset.qty))
    if (item.qcart <= 0) inCartList = inCartList.filter((c) => c !== item)
  } else if (removeBtn) {
    inCartList = inCartList.filter((c) => c.cartID != removeBtn.dataset.remove)
  } else return
  renderCart()
})

$('clearCartBtn').addEventListener('click', () => { inCartList = []; renderCart() })
$('deliverySelect').addEventListener('change', renderCart)

$('applyCouponBtn').addEventListener('click', () => {
  const code = $('couponInput').value.trim().toUpperCase()
  const msg = $('couponMessage')
  if (COUPONS[code]) {
    discount = COUPONS[code]
    msg.className = 'small mb-2 text-success'
    msg.innerHTML = `<i class="bi bi-check-circle me-1"></i>${code} applied – ${discount * 100}% off`
  } else {
    discount = 0
    msg.className = 'small mb-2 text-danger'
    msg.innerHTML = '<i class="bi bi-x-circle me-1"></i>Invalid coupon code'
  }
  renderCart()
})

let activeCategory = 'All'
function filterProducts() {
  const q = ($('searchInput')?.value || '').trim().toLowerCase()
  let shown = 0
  document.querySelectorAll('#productList > .col').forEach((col) => {
    const title = col.querySelector('.card-title').textContent.toLowerCase()
    const match = (activeCategory === 'All' || col.dataset.category === activeCategory) && title.includes(q)
    col.hidden = !match
    if (match) shown++
  })
  $('resultCount').textContent = `${shown} product${shown === 1 ? '' : 's'}`
  $('noResults').hidden = shown > 0
}

document.querySelectorAll('#categoryFilter [data-category]').forEach((btn) => {
  btn.addEventListener('click', () => {
    activeCategory = btn.dataset.category
    document.querySelectorAll('#categoryFilter [data-category]').forEach((b) => {
      b.classList.toggle('btn-danger', b === btn)
      b.classList.toggle('btn-outline-danger', b !== btn)
    })
    filterProducts()
  })
})
$('searchInput')?.addEventListener('input', filterProducts)
$('searchInput')?.closest('form').addEventListener('submit', (e) => e.preventDefault())

const checkoutModal = new bootstrap.Modal($('checkoutModal'))
const receiptModal = new bootstrap.Modal($('receiptModal'))

$('checkoutBtn').addEventListener('click', () => {
  bootstrap.Offcanvas.getInstance($('cartPanel'))?.hide()
  $('checkoutTotal').textContent = usd(getTotals().total)
  checkoutModal.show()
})
const orderBtn=document.getElementById("orderBtn")
orderBtn.addEventListener("click",(e)=>{
  e.preventDefault()
  window.open("https://pay.ababank.com/oRF8/obgrbds4","_blank")
})
$('checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault()
  const form = e.target
  if (!form.checkValidity()) {
    form.classList.add('was-validated')
    return
  }
  const t = getTotals()
  const payment = form.querySelector('[name="payment"]:checked').value
  $('receiptBody').innerHTML = `
    <div class="row mb-3">
      <div class="col-sm-6"><strong>${esc($('customerName').value)}</strong><br>${esc($('customerPhone').value)}<br>
        <span class="text-muted">${esc($('customerAddress').value)}</span></div>
      <div class="col-sm-6 text-sm-end"><small class="text-muted">Order #${Date.now().toString().slice(-6)}</small><br>
        ${new Date().toLocaleString()}<br>${payment}</div>
    </div>
    <table class="table table-sm align-middle">
      <thead><tr><th>Item</th><th class="text-center">Qty</th><th class="text-end">Price</th></tr></thead>
      <tbody>${inCartList.map((c) => `<tr><td>${c.cartTitle}</td><td class="text-center">${c.qcart}</td>
        <td class="text-end">${usd(c.cartPrice * c.qcart)}</td></tr>`).join('')}</tbody>
      <tfoot>
        <tr><td colspan="2">Subtotal</td><td class="text-end">${usd(t.subtotal)}</td></tr>
        <tr class="text-success"><td colspan="2">Discount</td><td class="text-end">−${usd(t.discountAmt)}</td></tr>
        <tr><td colspan="2">VAT 10%</td><td class="text-end">${usd(t.vat)}</td></tr>
        <tr><td colspan="2">Delivery</td><td class="text-end">${usd(t.delivery)}</td></tr>
        <tr class="fw-bold fs-5"><td colspan="2">Total</td><td class="text-end">${usd(t.total)}<br>
          <small class="text-muted fw-normal fs-6">${khr(t.total)}</small></td></tr>
      </tfoot>
    </table>`
  checkoutModal.hide()
  receiptModal.show()
  inCartList = []
  form.reset()
  form.classList.remove('was-validated')
  renderCart()
})

$('printBtn').addEventListener('click', () => window.print())

renderCart()

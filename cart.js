/* ============================================================
   NOIR & AURUM — cart
   Simple localStorage-backed cart. No backend: checkout hands
   the order to WhatsApp + manual bKash instructions (see app.js).
   ============================================================ */
window.NoirCart = (() => {
  const KEY = "noir-aurum-cart";
  const listeners = [];

  function read(){
    try{
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){ return []; }
  }
  function write(items){
    localStorage.setItem(KEY, JSON.stringify(items));
    listeners.forEach(fn => fn(items));
  }

  function findProduct(id){
    return window.NOIR_PRODUCTS.find(p => p.id === id);
  }

  return {
    onChange(fn){ listeners.push(fn); },

    getItems(){ return read(); },

    add(id, qty=1){
      const items = read();
      const existing = items.find(i => i.id === id);
      if(existing){ existing.qty += qty; }
      else { items.push({ id, qty }); }
      write(items);
    },

    setQty(id, qty){
      let items = read();
      if(qty <= 0){
        items = items.filter(i => i.id !== id);
      } else {
        const existing = items.find(i => i.id === id);
        if(existing) existing.qty = qty;
      }
      write(items);
    },

    remove(id){
      write(read().filter(i => i.id !== id));
    },

    clear(){ write([]); },

    count(){
      return read().reduce((sum, i) => sum + i.qty, 0);
    },

    detailed(){
      return read().map(i => {
        const p = findProduct(i.id);
        return p ? { ...p, qty: i.qty, lineTotal: p.price * i.qty } : null;
      }).filter(Boolean);
    },

    subtotal(){
      return this.detailed().reduce((sum, i) => sum + i.lineTotal, 0);
    },
  };
})();

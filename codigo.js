document.addEventListener("DOMContentLoaded", () => {
  const articulos = document.querySelectorAll("article");

  articulos.forEach(articulo => {
    articulo.addEventListener("click", () => {
      alert(`Has abierto el artículo: ${articulo.querySelector("h3").textContent}`);
    });
  });
});
 // Estado
    let rawAmount = 0;
    let method = 'tarjeta';

    const amountEl = document.getElementById('amount');
    const payBtn = document.getElementById('payBtn');
    const processingEl = document.getElementById('processing');
    const receiptEl = document.getElementById('receipt');

    const rAmount = document.getElementById('rAmount');
    const rMethod = document.getElementById('rMethod');
    const rAuth = document.getElementById('rAuth');
    const rDate = document.getElementById('rDate');

    const chipEls = document.querySelectorAll('.chip');
    const keys = document.querySelectorAll('.keypad .key');
    const clearAll = document.getElementById('clearAll');

    const card = document.getElementById('card');
    const nameInput = document.getElementById('name');
    const exp = document.getElementById('exp');
    const cvv = document.getElementById('cvv');

    const cardRow = document.getElementById('cardRow');
    const nameRow = document.getElementById('nameRow');
    const expRow = document.getElementById('expRow');
    const cvvRow = document.getElementById('cvvRow');
    const hint = document.getElementById('hint');

    // Formatear monto
    function formatAmount(value){
      const v = Math.max(0, value);
      return '$ ' + v.toLocaleString('es-CO');
    }
    function updateAmount(){
      amountEl.textContent = formatAmount(rawAmount);
      validateReady();
    }

    // Teclado
    keys.forEach(k=>{
      if(k.id==='payBtn') return;
      k.addEventListener('click',()=>{
        const t = k.textContent.trim();
        if(t==='⌫'){
          rawAmount = Math.floor(rawAmount/10);
        } else if(t===',00'){
          rawAmount = rawAmount*100; // añade centavos
        } else {
          rawAmount = rawAmount*10 + Number(t);
        }
        updateAmount();
      });
    });

    clearAll.addEventListener('click',()=>{
      rawAmount = 0; updateAmount();
    });

    // Método de pago
    chipEls.forEach(c=>{
      c.addEventListener('click',()=>{
        chipEls.forEach(x=>x.classList.remove('active'));
        c.classList.add('active');
        method = c.dataset.method;
        toggleFieldsByMethod(method);
        validateReady();
      });
    });

    function toggleFieldsByMethod(m){
      const showCard = (m==='tarjeta' || m==='qr');
      cardRow.style.display = showCard ? 'flex' : 'none';
      nameRow.style.display = showCard ? 'flex' : 'none';
      expRow.style.display = showCard ? 'flex' : 'none';
      cvvRow.style.display = showCard ? 'flex' : 'none';
      hint.textContent = showCard
        ? 'Completa los datos de pago.'
        : 'Pagarás en efectivo. Confirma el monto y presiona Pagar.';
    }

    // Formato de tarjeta y fecha
    card.addEventListener('input',()=>{
      let v = card.value.replace(/\D/g,'').slice(0,16);
      v = v.replace(/(.{4})/g,'$1 ').trim();
      card.value = v;
      validateReady();
    });
    exp.addEventListener('input',()=>{
      let v = exp.value.replace(/\D/g,'').slice(0,4);
      if(v.length>=3) v = v.slice(0,2) + '/' + v.slice(2);
      exp.value = v;
      validateReady();
    });
    nameInput.addEventListener('input', validateReady);
    cvv.addEventListener('input', validateReady);

    // Validación básica
    function isCardValid(){
      if(method==='efectivo') return true;
      const num = card.value.replace(/\s/g,'');
      const mm = exp.value.split('/')[0];
      const yy = exp.value.split('/')[1];
      const okNum = num.length>=13;
      const okName = nameInput.value.trim().length>=3;
      const okExp = mm && yy && Number(mm)>=1 && Number(mm)<=12 && yy.length===2;
      const okCvv = cvv.value.trim().length>=3;
      return okNum && okName && okExp && okCvv;
    }
    function validateReady(){
      const ready = rawAmount>0 && isCardValid();
      payBtn.disabled = !ready;
    }

    // Simular pago
    payBtn.addEventListener('click', async ()=>{
      processingEl.style.display = 'block';
      payBtn.disabled = true;

      await new Promise(r=>setTimeout(r, 1500)); // simulación de proceso

      processingEl.style.display = 'none';
      const auth = 'AP-' + Math.random().toString(36).slice(2,8).toUpperCase();

      // Mostrar recibo
      rAmount.textContent = formatAmount(rawAmount);
      rMethod.textContent = method.toUpperCase();
      rAuth.textContent = auth;
      rDate.textContent = new Date().toLocaleString('es-CO');

      receiptEl.style.display = 'block';
      // “Reset” básico del formulario (mantén método)
      rawAmount = 0; updateAmount();
      if(method!=='efectivo'){
        card.value=''; nameInput.value=''; exp.value=''; cvv.value='';
      }
    });

    // Recibo acciones
    document.getElementById('newPayment').addEventListener('click',()=>{
      receiptEl.style.display = 'none';
    });

    document.getElementById('download').addEventListener('click',()=>{
      const content = `
Recibo - Terminal de pago
-------------------------
Monto: ${rAmount.textContent}
Método: ${rMethod.textContent}
Autorización: ${rAuth.textContent}
Fecha: ${rDate.textContent}
`;
      const blob = new Blob([content], {type:'text/plain'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'recibo.txt'; // sencillo: TXT. Puedes integrar PDF real con librerías externas.
      a.click();
      URL.revokeObjectURL(a.href);
    });

    // Arranque
    toggleFieldsByMethod(method);
    updateAmount();
// Modal functionality
document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const modal = document.querySelector('#reservation-modal');
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    document.body.appendChild(backdrop);
  
    const addToCartBtn = document.querySelector('.add-to-cart');
    const addToCartBtn2 = document.querySelector('.open-reservation-modal');
    const closeModalBtns = document.querySelectorAll('.modal-close');
    const form = document.querySelector('#reservation-form');
    const step1 = document.querySelector('.step-1');
    const step2 = document.querySelector('.step-2');
    const backStepBtn = document.querySelector('#back-step');
    const confirmBtn = document.querySelector('#confirm-reservation');
    const confirmBtnWhatsapp = document.querySelector('#whatsapp-link');
    const decreaseQty = document.querySelector('#decrease-qty');
    const increaseQty = document.querySelector('#increase-qty');
    const quantityInput = document.querySelector('#quantity');
    const paymentOptions = document.querySelectorAll('input[name="payment-type"]');
    const totalFull = document.querySelector('#total-full');
    const totalHalf = document.querySelector('#total-half');
    const qrCodeCanvas = document.querySelector('#qr-code');
    const counterCount = document.querySelector('.counter .count');
    const decreaseCounter = document.querySelector('.counter .minus');
    const increaseCounter = document.querySelector('.counter .plus');
  
    // Preço base (extraído do .current-price)
    let basePrice;
    try {
      basePrice = parseFloat(document.querySelector('.current-price').textContent.replace('R$', '').trim());
    } catch (e) {
      console.error('Erro ao obter o preço:', e);
      basePrice = 120.00; // Fallback
    }
    let quantity = parseInt(counterCount.textContent) || 1;
  
    // Sincronizar quantidade inicial
    quantityInput.value = quantity;
  
    // Debug: Verificar elementos
    if (!addToCartBtn) {
      console.error('Botão .add-to-cart não encontrado. Verifique a classe no HTML.');
    } else {
      console.log('Botão .add-to-cart encontrado.');
    }
    if (!modal) {
      console.error('Modal #reservation-modal não encontrado. Verifique o HTML.');
    } else {
      console.log('Modal #reservation-modal encontrado.');
    }
  
    // Abrir modal
    addToCartBtn.addEventListener('click',  (e) => {
      e.preventDefault();
      console.log('Botão Pagar agora clicado. Quantidade:', quantity);
      if (quantity === 0) {
        alert('Selecione pelo menos uma passagem.');
        return;
      }
      modal.classList.add('active');
      backdrop.classList.add('active');
      quantityInput.value = quantity;
      updatePrices();
      updateQRCode();
    });
  
    // Fechar modal
    closeModalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        console.log('Fechando modal');
        modal.classList.remove('active');
        backdrop.classList.remove('active');
        resetModal();
      });
    });
  
    // Fechar modal clicando no backdrop
    backdrop.addEventListener('click', () => {
      modal.classList.remove('active');
      backdrop.classList.remove('active');
      resetModal();
    });
  
    // Atualizar contador no content
    decreaseCounter.addEventListener('click', () => {
      if (quantity > 0) {
        quantity--;
        counterCount.textContent = quantity;
        quantityInput.value = quantity;
        updatePrices();
        updateQRCode();
      }
    });
  
    increaseCounter.addEventListener('click', () => {
      quantity++;
      counterCount.textContent = quantity;
      quantityInput.value = quantity;
      updatePrices();
      updateQRCode();
    });
  
    // Validação do formulário (Etapa 1)
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm()) {
        console.log('Formulário validado, avançando para Etapa 2');
        showStep2();
      }
    });
  
    // Voltar para Etapa 1
    backStepBtn.addEventListener('click', () => {
      console.log('Voltando para Etapa 1');
      step2.classList.remove('active');
      step1.classList.add('active');
    });
  
    function confirmarReserva() {
      console.log('Confirmando reserva e enviando para WhatsApp');
    
      // Coletar informações
      const name = document.querySelector('#name').value.trim();
      const phone = document.querySelector('#phone').value.trim();
      const people = document.querySelector('#people').value;
      const date = new Date(document.querySelector('#date').value).toLocaleDateString('pt-BR');
      const product = 'Pacote Jericoacoara';
      const paymentType = document.querySelector('input[name="payment-type"]:checked').value;
      const total = paymentType === 'full' ? totalFull.textContent : totalHalf.textContent;
    
      // Formatar mensagem
      const message = `
        *Nova Reserva*\n
        *Produto*: ${product}\n
        *Nome*: ${name}\n
        *Telefone*: ${phone}\n
        *Quantidade de Pessoas*: ${people}\n
        *Data Desejada*: ${date}\n
        *Quantidade de Passagens*: ${quantity}\n
        *Tipo de Pagamento*: ${paymentType === 'full' ? 'Inteiro' : 'Meia Entrada'}\n
        *Valor Total*: R$${total}
      `.trim();
    
      const phoneNumber = '5585986935783';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
      window.open(whatsappUrl, '_blank');
    
      modal.classList.remove('active');
      backdrop.classList.remove('active');
      resetModal();
    }
    
    // Aplica o mesmo comportamento aos dois botões
    confirmBtn.addEventListener('click', confirmarReserva);
    confirmBtnWhatsapp.addEventListener('click', confirmarReserva);
    
  
    // Controle de quantidade no modal
    decreaseQty.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        quantityInput.value = quantity;
        counterCount.textContent = quantity;
        updatePrices();
        updateQRCode();
      }
    });
  
    increaseQty.addEventListener('click', () => {
      quantity++;
      quantityInput.value = quantity;
      counterCount.textContent = quantity;
      updatePrices();
      updateQRCode();
    });
  
    // Atualizar preços ao mudar tipo de pagamento
    paymentOptions.forEach(option => {
      option.addEventListener('change', () => {
        updatePrices();
        updateQRCode();
      });
    });
  
    // Função de validação
    function validateForm() {
      let isValid = true;
      const name = document.querySelector('#name').value.trim();
      const phone = document.querySelector('#phone').value.trim();
      const people = document.querySelector('#people').value;
      const date = document.querySelector('#date').value;
  
      // Nome
      if (!name) {
        showError('name', true);
        isValid = false;
      } else {
        showError('name', false);
      }
  
      // Telefone (formato: (XX) XXXXX-XXXX)
      const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
      if (!phoneRegex.test(phone)) {
        showError('phone', true);
        isValid = false;
      } else {
        showError('phone', false);
      }
  
      // Quantidade de pessoas
      if (people < 1) {
        showError('people', true);
        isValid = false;
      } else {
        showError('people', false);
      }
  
      // Data (deve ser futura)
      const today = new Date().toISOString().split('T')[0];
      if (!date || date < today) {
        showError('date', true);
        isValid = false;
      } else {
        showError('date', false);
      }
  
      return isValid;
    }
  
    // Mostrar/esconder erro
    function showError(fieldId, show) {
      const input = document.querySelector(`#${fieldId}`);
      const error = input.nextElementSibling;
      if (show) {
        input.classList.add('error');
        error.style.display = 'block';
      } else {
        input.classList.remove('error');
        error.style.display = 'none';
      }
    }
  
    // Mostrar Etapa 2 e preencher resumo
    function showStep2() {
      step1.classList.remove('active');
      step2.classList.add('active');
  
      document.querySelector('#summary-name').textContent = document.querySelector('#name').value;
      document.querySelector('#summary-phone').textContent = document.querySelector('#phone').value;
      document.querySelector('#summary-people').textContent = document.querySelector('#people').value;
      document.querySelector('#summary-date').textContent = new Date(document.querySelector('#date').value).toLocaleDateString('pt-BR');
  
      updatePrices();
      updateQRCode();
    }
  
    // Atualizar preços
    function updatePrices() {
      const fullPrice = (basePrice * quantity).toFixed(2);
      const halfPrice = (fullPrice / 2).toFixed(2);
      totalFull.textContent = fullPrice;
      totalHalf.textContent = halfPrice;
    }
  
    // Atualizar QR Code
    function updateQRCode() {
      if (typeof QRCode === 'undefined') {
        console.error('Biblioteca QRCode.js não carregada.');
        return;
      }
      const paymentType = document.querySelector('input[name="payment-type"]:checked').value;
      const total = paymentType === 'full' ? totalFull.textContent : totalHalf.textContent;
      const qrData = `Reserva: Pacote Jericoacoara, Quantidade: ${quantity}, Total: R$${total}`;
      qrCodeCanvas.innerHTML = '';
      new QRCode(qrCodeCanvas, {
        text: qrData,
        width: 150,
        height: 150
      });
    }
  
    // Resetar modal
    function resetModal() {
      form.reset();
      quantity = parseInt(counterCount.textContent) || 1;
      quantityInput.value = quantity;
      document.querySelector('input[name="payment-type"][value="full"]').checked = true;
      step2.classList.remove('active');
      step1.classList.add('active');
      document.querySelectorAll('.error').forEach(input => input.classList.remove('error'));
      document.querySelectorAll('.error-message').forEach(error => error.style.display = 'none');
    }
  });
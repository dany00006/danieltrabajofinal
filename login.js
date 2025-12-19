// Obtener los formularios
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Función para alternar entre formularios
function toggleForms() {
  loginForm.classList.toggle('hidden');
  registerForm.classList.toggle('hidden');
}

// Función para mostrar mensajes
function showError(formType, message) {
  const errorElement = document.getElementById(`${formType}Error`);
  const successElement = document.getElementById(`${formType}Success`);
  const loadingElement = document.getElementById(`${formType}Loading`);
  
  errorElement.textContent = message;
  errorElement.classList.add('show');
  successElement.classList.remove('show');
  loadingElement.classList.remove('show');
}

function showSuccess(formType, message) {
  const errorElement = document.getElementById(`${formType}Error`);
  const successElement = document.getElementById(`${formType}Success`);
  const loadingElement = document.getElementById(`${formType}Loading`);
  
  successElement.textContent = message;
  successElement.classList.add('show');
  errorElement.classList.remove('show');
  loadingElement.classList.remove('show');
}

function showLoading(formType) {
  const loadingElement = document.getElementById(`${formType}Loading`);
  const errorElement = document.getElementById(`${formType}Error`);
  const successElement = document.getElementById(`${formType}Success`);
  
  loadingElement.classList.add('show');
  errorElement.classList.remove('show');
  successElement.classList.remove('show');
}

function hideMessages(formType) {
  const errorElement = document.getElementById(`${formType}Error`);
  const successElement = document.getElementById(`${formType}Success`);
  const loadingElement = document.getElementById(`${formType}Loading`);
  
  errorElement.classList.remove('show');
  successElement.classList.remove('show');
  loadingElement.classList.remove('show');
}

// Mostrar estado de conexión en la consola
document.addEventListener('DOMContentLoaded', async () => {
  console.log("=== VERIFICACIÓN DE SUPABASE ===");
  
  // Esperar a que la función `obtenerUsuarioActual` esté disponible
  let wait = 0;
  while (typeof window.obtenerUsuarioActual !== 'function' && wait < 20) {
    await new Promise(resolve => setTimeout(resolve, 200));
    wait++;
  }

  if (typeof window.obtenerUsuarioActual !== 'function') {
    console.error("⚠ Error: Las funciones de Supabase no se cargaron correctamente");
    showError('login', 'Error de conexión. Por favor recarga la página.');
    return;
  }

  console.log("✓ Funciones de Supabase cargadas correctamente");

  try {
    const usuario = await window.obtenerUsuarioActual();
    
    if (usuario.logueado) {
      console.log("✓ Ya existe una sesión activa para:", usuario.usuario.email);
      // Redirigir a articulos si ya está logueado
      setTimeout(() => {
        window.location.href = 'articulos.html';
      }, 1000);
    } else {
      console.log("✓ Formularios listos");
    }
  } catch (err) {
    console.error("Error al verificar usuario:", err);
  }
});

// ===== EVENTO: FORMULARIO DE LOGIN =====
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages('login');
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validar que los campos no estén vacíos
    if (!email || !password) {
      showError('login', 'Por favor completa todos los campos');
      return;
    }
    
    // Validar formato de email
    if (!email.includes('@')) {
      showError('login', 'Por favor ingresa un correo válido');
      return;
    }
    
    console.log("Intentando iniciar sesión con:", email);
    showLoading('login');
    
    try {
      // Intentar iniciar sesión
      const resultado = await window.iniciarSesion(email, password);
      
      if (resultado.success) {
        showSuccess('login', '¡Bienvenido! Redirigiendo...');
        // Redirigir a otra página después del login exitoso
        setTimeout(() => {
          window.location.href = 'articulos.html';
        }, 1500);
      } else {
        console.error("Error en login:", resultado.message);
        showError('login', 'Error: ' + resultado.message);
      }
    } catch (error) {
      console.error("Excepción en login:", error);
      showError('login', 'Error inesperado: ' + error.message);
    }
  });
}

// ===== EVENTO: FORMULARIO DE REGISTRO =====
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessages('register');
    
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    // Validaciones
    if (!email || !password || !passwordConfirm) {
      showError('register', 'Por favor completa todos los campos');
      return;
    }
    
    if (!email.includes('@')) {
      showError('register', 'Por favor ingresa un correo válido');
      return;
    }
    
    if (password.length < 6) {
      showError('register', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (password !== passwordConfirm) {
      showError('register', 'Las contraseñas no coinciden');
      return;
    }
    
    console.log("Intentando registrar usuario:", email);
    showLoading('register');
    
    try {
      // Intentar registrar usuario
      const resultado = await window.registrarUsuario(email, password);
      
      if (resultado.success) {
        showSuccess('register', '¡Cuenta creada! Redirigiendo al login...');
        // Limpiar formulario y cambiar a login
        setTimeout(() => {
          registerForm.reset();
          toggleForms();
          hideMessages('register');
        }, 1500);
      } else {
        console.error("Error en registro:", resultado.message);
        // Mensajes específicos según el error
        if (resultado.message.includes('already registered')) {
          showError('register', 'Este correo ya está registrado. Intenta iniciar sesión');
        } else if (resultado.message.includes('invalid email')) {
          showError('register', 'Correo inválido');
        } else {
          showError('register', 'Error: ' + resultado.message);
        }
      }
    } catch (error) {
      console.error("Excepción en registro:", error);
      showError('register', 'Error inesperado: ' + error.message);
    }
  });
}
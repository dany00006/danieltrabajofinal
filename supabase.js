// Configuración de Supabase (reemplaza con tu Project URL y anon key)
const supabaseUrl = "https://wmeudjemclsofspwdpjd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZXVkamVtY2xzb2ZzcHdkcGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDc3MzEsImV4cCI6MjA4MTY4MzczMX0.1mOU-nRfMCLUIP1AzOvAYMrKkG4GgqJItQ5pIcfE3_w";

// Variable global para el cliente
let supabase = null;

// Helper: asegurar que el cliente está inicializado
function ensureClient() {
  if (supabase) return true;
  // Intentar inicializar (si la librería UMD ya expone window.supabase)
  const ok = initSupabase();
  return !!ok && !!supabase;
}

// Función para inicializar Supabase
function initSupabase() {
  if (supabase) return; // Ya está inicializado
  
  if (typeof window.supabase === 'undefined') {
    console.error("❌ Error: La librería de Supabase no se ha cargado");
    return false;
  }
  
  try {
    supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    console.log("✓ Cliente Supabase inicializado correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error al inicializar Supabase:", error);
    return false;
  }
}

// Esperar a que el DOM y la librería estén listas, intentar cargar UMD si es necesario
// Inicializar Supabase cuando el DOM esté listo si la librería ya está cargada.
document.addEventListener('DOMContentLoaded', async () => {
  const initialized = initSupabase();
  if (!initialized) {
    console.warn('La librería de Supabase no está disponible en esta página. Asegúrate de incluir el script CDN UMD o cargar la librería antes de `supabase.js`.');
    return;
  }

  // Verificar conexión después de inicializar
  try {
    console.log("Verificando conexión con Supabase...");
    const conexion = await verificarConexion();

    if (conexion.conectado) {
      console.log("✓ Conectado a Supabase correctamente");
      const usuario = await obtenerUsuarioActual();
      if (usuario.logueado) {
        console.log("✓ Usuario logueado como:", usuario.usuario.email);
      } else {
        console.log("✓ No hay usuario logueado actualmente");
      }
    } else {
      console.error("✗ Error de conexión:", conexion.error);
    }
  } catch (err) {
    console.error("Error verificando conexión:", err);
  }
});

// Función para registrar usuario
async function registrarUsuario(email, password) {
  if (!ensureClient()) {
    return { success: false, message: "Supabase no está inicializado. Asegúrate de incluir la librería UMD de Supabase antes de `supabase.js` y recarga la página." };
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    
    if (error) {
      console.error("Error al registrar:", error.message);
      return { success: false, message: error.message };
    }
    
    console.log("Usuario registrado:", data);
    return { success: true, message: "Registro exitoso" };
  } catch (err) {
    console.error("Error en registrarUsuario:", err);
    return { success: false, message: err.message };
  }
}

// Función para iniciar sesión
async function iniciarSesion(email, password) {
  if (!ensureClient()) {
    return { success: false, message: "Supabase no está inicializado. Asegúrate de incluir la librería UMD de Supabase antes de `supabase.js` y recarga la página." };
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) {
      console.error("Error al iniciar sesión:", error.message);
      return { success: false, message: error.message };
    }
    
    console.log("Sesión iniciada:", data);
    return { success: true, message: "Inicio de sesión exitoso" };
  } catch (err) {
    console.error("Error en iniciarSesion:", err);
    return { success: false, message: err.message };
  }
}

// Función para cerrar sesión
async function cerrarSesion() {
  if (!ensureClient()) {
    return { success: false, message: "Supabase no está inicializado" };
  }
  
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Error al cerrar sesión:", error.message);
      return { success: false, message: error.message };
    }
    
    console.log("Sesión cerrada");
    return { success: true, message: "Sesión cerrada" };
  } catch (err) {
    console.error("Error en cerrarSesion:", err);
    return { success: false, message: err.message };
  }
}

// Función para verificar la conexión con Supabase
async function verificarConexion() {
  if (!ensureClient()) {
    return { conectado: false, error: "Supabase no está inicializado" };
  }
  
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error al verificar conexión:", error.message);
      return { conectado: false, error: error.message };
    }
    
    console.log("Conexión exitosa con Supabase");
    return { conectado: true, sesion: data.session };
  } catch (err) {
    console.error("Error al conectar con Supabase:", err.message);
    return { conectado: false, error: err.message };
  }
}

// Función para obtener el usuario actual
async function obtenerUsuarioActual() {
  if (!ensureClient()) {
    return { logueado: false, usuario: null };
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error("Error al obtener usuario:", error.message);
      return { logueado: false, usuario: null };
    }
    
    if (user) {
      console.log("Usuario actual:", user.email);
      return { logueado: true, usuario: user };
    }
    
    return { logueado: false, usuario: null };
  } catch (err) {
    console.error("Error en obtenerUsuarioActual:", err);
    return { logueado: false, usuario: null };
  }
}

// (La verificación se hace automáticamente después de la inicialización en waitAndInit)

// Función para obtener artículos de la base de datos
async function obtenerArticulos() {
  if (!ensureClient()) {
    console.error("Supabase no está inicializado");
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('articulos')
      .select('*');
    
    if (error) {
      console.error("Error al obtener artículos:", error.message);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Error en obtenerArticulos:", err);
    return [];
  }
}

// Función para agregar artículo al carrito
async function agregarAlCarrito(usuarioId, articuloId, cantidad = 1) {
  if (!ensureClient()) {
    return { success: false, message: "Supabase no está inicializado" };
  }
  
  try {
    const { data, error } = await supabase
      .from('carrito')
      .insert([
        {
          usuario_id: usuarioId,
          articulo_id: articuloId,
          cantidad: cantidad
        }
      ]);
    
    if (error) {
      console.error("Error al agregar al carrito:", error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: "Artículo agregado al carrito" };
  } catch (err) {
    console.error("Error en agregarAlCarrito:", err);
    return { success: false, message: err.message };
  }
}

// Función para obtener carrito del usuario
async function obtenerCarrito(usuarioId) {
  if (!ensureClient()) {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('carrito')
      .select(`
        *,
        articulos(*)
      `)
      .eq('usuario_id', usuarioId);
    
    if (error) {
      console.error("Error al obtener carrito:", error.message);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error("Error en obtenerCarrito:", err);
    return [];
  }
}

// Función para crear un pedido
async function crearPedido(usuarioId, total) {
  if (!ensureClient()) {
    return { success: false, message: "Supabase no está inicializado" };
  }
  
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([
        {
          usuario_id: usuarioId,
          total: total,
          estado: 'pendiente'
        }
      ]);
    
    if (error) {
      console.error("Error al crear pedido:", error.message);
      return { success: false, message: error.message };
    }
    
    return { success: true, message: "Pedido creado exitosamente" };
  } catch (err) {
    console.error("Error en crearPedido:", err);
    return { success: false, message: err.message };
  }
}

// Exponer funciones globalmente para que otros scripts las puedan usar
window.initSupabase = initSupabase;
window.registrarUsuario = registrarUsuario;
window.iniciarSesion = iniciarSesion;
window.cerrarSesion = cerrarSesion;
window.verificarConexion = verificarConexion;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.obtenerArticulos = obtenerArticulos;
window.agregarAlCarrito = agregarAlCarrito;
window.obtenerCarrito = obtenerCarrito;
window.crearPedido = crearPedido;

// Configuración de Supabase (reemplaza con tu Project URL y anon key)
const supabaseUrl = "https://wmeudjemclsofspwdpjd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZXVkamVtY2xzb2ZzcHdkcGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMDc3MzEsImV4cCI6MjA4MTY4MzczMX0.1mOU-nRfMCLUIP1AzOvAYMrKkG4GgqJItQ5pIcfE3_w";

// Variable global para el cliente (evitar declarar `supabase` porque lo usa la UMD)
let supabaseClient = null;
let supabaseReady = false;

// Intentar cargar dinámicamente el UMD de Supabase si no está presente
function loadSupabaseUmd(src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.umd.min.js') {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window object'));
    if (typeof window.supabase !== 'undefined') return resolve(true);

    const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src && s.src.includes('supabase') );
    if (existing) {
      // si hay un script con supabase en el src, esperar a que cargue
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => reject(new Error('Error cargando script existente')));
      return;
    }

    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error('Error cargando UMD de Supabase desde CDN'));
    document.head.appendChild(s);
  });
}

// Función para esperar a que la librería de Supabase esté disponible
async function waitForSupabase(maxWait = 15000) {
  const startTime = Date.now();

  // Si no existe, intentamos cargarla dinámicamente una vez
  if (typeof window.supabase === 'undefined') {
    try {
      await loadSupabaseUmd();
    } catch (err) {
      console.warn('No se pudo cargar automáticamente el UMD:', err.message);
      // seguiremos esperando por si el script se carga por otro medio
    }
  }

  while (typeof window.supabase === 'undefined') {
    if (Date.now() - startTime > maxWait) {
      console.error('❌ Timeout: La librería de Supabase no se cargó en', maxWait, 'ms');
      return false;
    }
    // pequeños intervalos para evitar bloquear el hilo
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log('✓ Librería de Supabase detectada');
  return true;
}

// Helper: asegurar que el cliente está inicializado
async function ensureClient() {
  if (supabaseClient) return true;
  
  // Esperar a que Supabase esté listo
  if (!supabaseReady) {
    const ready = await waitForSupabase();
    if (!ready) return false;
  }
  
  // Intentar inicializar
  const ok = await initSupabase();
  return !!ok && !!supabaseClient;
}

// Función para inicializar Supabase
async function initSupabase() {
  if (supabaseClient) return true; // Ya está inicializado
  
  // Esperar a que la librería esté disponible
  const ready = await waitForSupabase();
  if (!ready) {
    return false;
  }
  
  try {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
    // También exponemos una referencia al cliente
    window.supabaseClient = supabaseClient;
    supabaseReady = true;
    console.log("✓ Cliente Supabase inicializado correctamente");
    return true;
  } catch (error) {
    console.error("❌ Error al inicializar Supabase:", error);
    return false;
  }
}

// Inicializar Supabase cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  console.log("Iniciando carga de Supabase...");
  
  const initialized = await initSupabase();
  if (!initialized) {
    console.warn('⚠ La librería de Supabase no pudo inicializarse. Verifica:');
    console.warn('  1. Que el script CDN se haya cargado correctamente');
    console.warn('  2. Que no haya errores de CORS');
    console.warn('  3. Que tu conexión a internet sea estable');
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
  if (!await ensureClient()) {
    return { success: false, message: "Supabase no está inicializado. Por favor recarga la página." };
  }
  
  try {
    const { data, error } = await supabaseClient.auth.signUp({
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
  if (!await ensureClient()) {
    return { success: false, message: "Supabase no está inicializado. Por favor recarga la página." };
  }
  
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
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
  if (!await ensureClient()) {
    return { success: false, message: "Supabase no está inicializado" };
  }
  
  try {
    const { error } = await supabaseClient.auth.signOut();
    
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
  if (!await ensureClient()) {
    return { conectado: false, error: "Supabase no está inicializado" };
  }
  
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    
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
// Función para obtener el usuario actual
async function obtenerUsuarioActual() {
  if (!await ensureClient()) {
    return { logueado: false, usuario: null };
  }
  
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
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

// Función para obtener el usuario actual
async function obtenerUsuarioActual() {
  if (!await ensureClient()) {
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

// Función para obtener artículos de la base de datos
async function obtenerArticulos() {
  if (!await ensureClient()) {
    console.error("Supabase no está inicializado");
    return [];
  }
  
  try {
    const { data, error } = await supabaseClient
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
  if (!await ensureClient()) {
    return { success: false, message: "Supabase no está inicializado" };
  }
  
  try {
    const { data, error } = await supabaseClient
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
  if (!await ensureClient()) {
    return [];
  }
  
  try {
    const { data, error } = await supabaseClient
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
  if (!await ensureClient()) {
    return { success: false, message: "Supabase no está inicializado" };
  }
  
  try {
    const { data, error } = await supabaseClient
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
window.ensureClient = ensureClient;
window.registrarUsuario = registrarUsuario;
window.iniciarSesion = iniciarSesion;
window.cerrarSesion = cerrarSesion;
window.verificarConexion = verificarConexion;
window.obtenerUsuarioActual = obtenerUsuarioActual;
window.obtenerArticulos = obtenerArticulos;
window.agregarAlCarrito = agregarAlCarrito;
window.obtenerCarrito = obtenerCarrito;
window.crearPedido = crearPedido;

// Para compatibilidad, también exponemos el cliente si ya está inicializado
if (supabaseClient) window.supabaseClient = supabaseClient;

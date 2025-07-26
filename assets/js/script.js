// Wrapper para SweetAlert con z-index correcto
function showSwal(options) {
    const defaultOptions = {
        zIndex: 15000,
        backdrop: 'rgba(0,0,0,0.8)',
        heightAuto: false
    };
    
    return Swal.fire({
        ...defaultOptions,
        ...options
    });
}

// Navegación suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Función para contacto por WhatsApp
function contactWhatsApp() {
    const message = encodeURIComponent(
        '¡Hola Publicidad! Me interesa el Combo Publicidad Completo por $100,000. ¿Podrían darme más información?'
    );
    // Número de WhatsApp actualizado
    const phoneNumber = '573017454361';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

// === PANEL DE ADMINISTRACIÓN ===

// Abrir panel de administración
async function openAdminPanel() {
    // Solicitar contraseña antes de abrir el panel
    const { value: password } = await showSwal({
        title: 'Panel de Administración',
        text: 'Ingresa la contraseña para acceder:',
        input: 'password',
        inputPlaceholder: 'Contraseña',
        showCancelButton: true,
        confirmButtonText: 'Acceder',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#4F46E5',
        zIndex: 15000,
        backdrop: 'rgba(0,0,0,0.8)',
        inputValidator: (value) => {
            if (!value) {
                return 'Debes ingresar una contraseña'
            }
        }
    });
    
    if (password === '3003') {
        const panel = document.getElementById('adminPanel');
        panel.classList.add('active');
        loadSavedUrls();
    } else if (password) { // Solo mostrar error si se ingresó algo
        await showSwal({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'Contraseña incorrecta',
            confirmButtonColor: '#4F46E5',
            zIndex: 15000,
            backdrop: 'rgba(0,0,0,0.8)'
        });
    }
}

// Cerrar panel de administración
function closeAdminPanel() {
    const panel = document.getElementById('adminPanel');
    panel.classList.remove('active');
}

// Cargar URLs guardadas del servidor
async function loadSavedUrls() {
    try {
        const response = await fetch('api/urls.php');
        const result = await response.json();
        
        if (result.success) {
            const savedUrls = result.data;
    Object.keys(savedUrls).forEach(key => {
        const input = document.getElementById(key + 'Url');
        if (input) {
            input.value = savedUrls[key];
        }
    });
}
    } catch (error) {
        console.error('Error cargando URLs:', error);
        showSwal({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudieron cargar las URLs guardadas',
            confirmButtonColor: '#4F46E5'
        });
    }
}

// Guardar URL en el servidor
async function saveUrl(mediaType, url) {
    try {
        const response = await fetch('api/urls.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mediaType: mediaType,
                url: url
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Error al guardar');
        }
        
        return result;
    } catch (error) {
        console.error('Error guardando URL:', error);
        throw error;
    }
}

// Actualizar todos los medios de una vez
async function updateAllMedia() {
    // Obtener todos los tipos de media y sus URLs
    const mediaTypes = ['logo', 'publicidad', 'video', 'logoAnimado', 'mockup', 'tarjetas', 'paginaWeb'];
    const urlsToUpdate = {};
    const validUrls = [];
    
    // Validar todas las URLs ingresadas
    for (const mediaType of mediaTypes) {
        const input = document.getElementById(mediaType + 'Url');
        const url = input.value.trim();
        
        if (url) {
            // Validar URL básica
            try {
                new URL(url);
                urlsToUpdate[mediaType] = url;
                validUrls.push(mediaType);
            } catch (e) {
                showSwal({
                    icon: 'error',
                    title: 'URL inválida',
                    text: `La URL de ${mediaType} no es válida. Asegúrate de incluir http:// o https://`,
                    confirmButtonColor: '#4F46E5'
                });
                return;
            }
        }
    }
    
    // Verificar si hay URLs válidas para actualizar
    if (validUrls.length === 0) {
        showSwal({
            icon: 'warning',
            title: 'Sin URLs',
            text: 'Por favor ingresa al menos una URL válida para actualizar',
            confirmButtonColor: '#4F46E5',
            zIndex: 15000,
            backdrop: 'rgba(0,0,0,0.8)'
        });
        return;
    }
    
    // Mostrar loading con contador
    showSwal({
        title: 'Actualizando...',
        html: `Procesando <b>0</b> de <b>${validUrls.length}</b> elementos`,
        allowOutsideClick: false,
        zIndex: 15000,
        backdrop: 'rgba(0,0,0,0.8)',
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Procesar cada URL válida
    for (let i = 0; i < validUrls.length; i++) {
        const mediaType = validUrls[i];
        const url = urlsToUpdate[mediaType];
        
        // Actualizar el contador en el modal
        Swal.getHtmlContainer().querySelector('b').textContent = i + 1;
        
        try {
            // Guardar URL en el servidor
            await saveUrl(mediaType, url);
            
            // Actualizar la visualización
            displayMedia(mediaType, url);
            
            successCount++;
        } catch (error) {
            errorCount++;
            errors.push(`${mediaType}: ${error.message}`);
            console.error(`Error actualizando ${mediaType}:`, error);
        }
        
        // Pequeña pausa para mejor UX
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Mostrar resultado final
    if (errorCount === 0) {
        showSwal({
            icon: 'success',
            title: '¡Actualización Completa!',
            html: `
                <div style="text-align: center;">
                    <p><strong>${successCount}</strong> elementos actualizados exitosamente</p>
                    <div style="margin: 1rem 0; font-size: 0.9rem; color: #6B7280;">
                        ${validUrls.map(type => `✅ ${type}`).join('<br>')}
                    </div>
                </div>
            `,
            confirmButtonColor: '#4F46E5',
            timer: 3000,
            showConfirmButton: false
        });
        
        // Cerrar panel después de actualizar
        setTimeout(() => {
            closeAdminPanel();
        }, 1000);
        
    } else if (successCount > 0) {
        showSwal({
            icon: 'warning',
            title: 'Actualización Parcial',
            html: `
                <div style="text-align: left;">
                    <p><strong>✅ Exitosos:</strong> ${successCount}</p>
                    <p><strong>❌ Con errores:</strong> ${errorCount}</p>
                    <br>
                    <p><strong>Errores:</strong></p>
                    <ul style="font-size: 0.9rem; color: #EF4444;">
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            `,
            confirmButtonColor: '#4F46E5'
        });
    } else {
        showSwal({
            icon: 'error',
            title: 'Error en la Actualización',
            html: `
                <div style="text-align: left;">
                    <p>No se pudo actualizar ningún elemento.</p>
                    <br>
                    <p><strong>Errores:</strong></p>
                    <ul style="font-size: 0.9rem; color: #EF4444;">
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            `,
            confirmButtonColor: '#4F46E5'
        });
    }
}

// Mantener la función original para compatibilidad (pero ya no se usa en el HTML)
async function updateMedia(mediaType) {
    const input = document.getElementById(mediaType + 'Url');
    const url = input.value.trim();
    
    if (!url) {
        showSwal({
            icon: 'warning',
            title: 'Campo vacío',
            text: 'Por favor ingresa una URL válida',
            confirmButtonColor: '#4F46E5'
        });
        return;
    }
    
    // Validar URL básica
    try {
        new URL(url);
    } catch (e) {
        showSwal({
            icon: 'error',
            title: 'URL inválida',
            text: 'URL no válida. Asegúrate de incluir http:// o https://',
            confirmButtonColor: '#4F46E5'
        });
        return;
    }
    
    // Mostrar loading
    showSwal({
        title: 'Guardando...',
        text: 'Actualizando la información',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    try {
        // Guardar URL en el servidor
        await saveUrl(mediaType, url);
    
    // Actualizar la visualización
    displayMedia(mediaType, url);
    
    // Mensaje de confirmación
    showSwal({
        icon: 'success',
        title: '¡Actualizado!',
        text: `${mediaType} actualizado exitosamente`,
        confirmButtonColor: '#4F46E5',
        timer: 2000,
        showConfirmButton: false
    });
    
    // Cerrar panel después de actualizar
    setTimeout(() => {
        closeAdminPanel();
    }, 500);
        
    } catch (error) {
        showSwal({
            icon: 'error',
            title: 'Error al guardar',
            text: 'No se pudo actualizar la información. Inténtalo de nuevo.',
            confirmButtonColor: '#4F46E5'
        });
    }
}

// Mostrar media en la página - ACTUALIZADA PARA MANEJAR PÁGINAS WEB
function displayMedia(mediaType, url) {
    const mediaContainer = document.getElementById(mediaType + 'Media');
    if (!mediaContainer) return;
    
    // Determinar tipo de archivo por extensión o contenido de URL
    const fileExtension = url.split('.').pop().toLowerCase().split('?')[0]; // Remover parámetros de query
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    
    let mediaElement;
    
    // Detectar videos de YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtube.com/watch')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        
        if (videoId) {
            mediaElement = `
                <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allowfullscreen>
                </iframe>
            `;
        }
    }
    // Detectar videos por extensión
    else if (videoExtensions.includes(fileExtension)) {
        mediaElement = `
            <video controls style="width: 100%; height: 100%; object-fit: cover;">
                <source src="${url}" type="video/mp4">
                Tu navegador no soporta el elemento video.
            </video>
        `;
    }
    // Detectar imágenes por extensión
    else if (imageExtensions.includes(fileExtension)) {
        mediaElement = `
            <img src="${url}" 
                 alt="${mediaType}" 
                 style="max-width: 100%; max-height: 100%; object-fit: contain;"
                 onerror="this.parentElement.innerHTML='<div class=&quot;placeholder-media&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><span>Error cargando imagen</span></div>'">
        `;
    }
    // Detectar páginas web (URLs sin extensión específica o con extensiones web)
    else if (url.includes('http') && (
        !fileExtension || 
        fileExtension === 'html' || 
        fileExtension === 'php' || 
        fileExtension === 'com' || 
        fileExtension === 'net' || 
        fileExtension === 'org' ||
        url.includes('/') && !imageExtensions.includes(fileExtension) && !videoExtensions.includes(fileExtension)
    )) {
        // Para páginas web, mostrar un iframe con la página
        mediaElement = `
            <div style="position: relative; width: 100%; height: 100%; background: #f3f4f6; border-radius: 8px; overflow: hidden;">
                <iframe 
                    src="${url}" 
                    width="100%" 
                    height="100%" 
                    frameborder="0"
                    style="transform: scale(0.5); transform-origin: 0 0; width: 200%; height: 200%;"
                    title="Vista previa de página web">
                </iframe>
                <div style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                    <i class="fas fa-external-link-alt"></i>
                </div>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; padding: 8px; font-size: 0.9rem; text-align: center;">
                    <a href="${url}" target="_blank" style="color: white; text-decoration: none;">
                        <i class="fas fa-eye"></i> Ver página completa
                    </a>
                </div>
            </div>
        `;
    }
    // Si detecta que podría ser una imagen por el contexto pero sin extensión
    else if (url.includes('image') || url.includes('photo') || url.includes('pic')) {
        mediaElement = `
            <img src="${url}" 
                 alt="${mediaType}" 
                 style="max-width: 100%; max-height: 100%; object-fit: contain;"
                 onerror="this.parentElement.innerHTML='<div class=&quot;placeholder-media&quot;><i class=&quot;fas fa-exclamation-triangle&quot;></i><span>Error cargando imagen</span></div>'">
        `;
    }
    // Por defecto, intentar como imagen
    else {
        mediaElement = `
            <img src="${url}" 
                 alt="${mediaType}" 
                 style="max-width: 100%; max-height: 100%; object-fit: contain;"
                 onerror="this.parentElement.innerHTML='<div class=&quot;placeholder-media&quot;><i class=&quot;fas fa-globe&quot;></i><span>Contenido web - <a href=&quot;${url}&quot; target=&quot;_blank&quot; style=&quot;color: #4F46E5;&quot;>Ver enlace</a></span></div>'">
        `;
    }
    
    mediaContainer.innerHTML = mediaElement;
}

// Resetear todos los medios
async function resetAllMedia() {
    const result = await showSwal({
        title: '¿Estás seguro?',
        text: '¿Quieres eliminar todos los medios? Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Sí, eliminar todo',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        // Mostrar loading
        showSwal({
            title: 'Eliminando...',
            text: 'Borrando todos los medios',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        try {
            // Eliminar todos los medios del servidor
            const response = await fetch('api/urls.php', {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Error al eliminar');
            }
        
        // Limpiar todos los inputs
        const inputs = document.querySelectorAll('.admin-section input');
        inputs.forEach(input => input.value = '');
        
        // Resetear visualizaciones
        const mediaTypes = ['logo', 'publicidad', 'video', 'logoAnimado', 'mockup', 'tarjetas', 'paginaWeb'];
        mediaTypes.forEach(type => {
            const container = document.getElementById(type + 'Media');
            if (container) {
                const placeholders = {
                    logo: '<i class="fas fa-image"></i><span>Logo aquí</span>',
                    publicidad: '<i class="fas fa-bullhorn"></i><span>Publicidad aquí</span>',
                    video: '<i class="fas fa-play"></i><span>Video aquí</span>',
                    logoAnimado: '<i class="fas fa-magic"></i><span>Logo animado aquí</span>',
                    mockup: '<i class="fas fa-tshirt"></i><span>Mockup aquí</span>',
                    tarjetas: '<i class="fas fa-id-card"></i><span>Tarjetas aquí</span>',
                    paginaWeb: '<i class="fas fa-laptop"></i><span>Página web aquí</span>'
                };
                
                container.innerHTML = `<div class="placeholder-media">${placeholders[type]}</div>`;
            }
        });
        
        showSwal({
            icon: 'success',
            title: 'Eliminado',
            text: 'Todos los medios han sido eliminados',
            confirmButtonColor: '#4F46E5',
            timer: 2000,
            showConfirmButton: false
        });
        closeAdminPanel();
            
        } catch (error) {
            showSwal({
                icon: 'error',
                title: 'Error al eliminar',
                text: 'No se pudieron eliminar los medios. Inténtalo de nuevo.',
                confirmButtonColor: '#4F46E5'
            });
        }
    }
}

// Cargar medios guardados al iniciar la página
async function loadSavedMedia() {
    try {
        const response = await fetch('api/urls.php');
        const result = await response.json();
        
        if (result.success) {
            const savedUrls = result.data;
    Object.keys(savedUrls).forEach(mediaType => {
                if (savedUrls[mediaType]) {
        displayMedia(mediaType, savedUrls[mediaType]);
                }
    });
        }
    } catch (error) {
        console.error('Error cargando medios:', error);
        // No mostrar error al usuario en la carga inicial para no interrumpir la experiencia
    }
}

// === FUNCIONES EXISTENTES ===

// Animación simple para elementos cuando aparecen en pantalla
function animateOnScroll() {
    const elements = document.querySelectorAll('.service-item, .step');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Validación básica de teléfono
function validatePhone(phone) {
    const regex = /^(\+57|57)?[0-9]{10}$/;
    return regex.test(phone.replace(/\s/g, ''));
}

// Contador simple para mostrar el precio de forma atractiva
function animatePrice() {
    const priceElement = document.querySelector('.price');
    if (!priceElement) return;
    
    let currentPrice = 0;
    const targetPrice = 100000;
    const increment = 3000;
    const duration = 50; // milliseconds
    
    const timer = setInterval(() => {
        currentPrice += increment;
        if (currentPrice >= targetPrice) {
            currentPrice = targetPrice;
            clearInterval(timer);
        }
        priceElement.textContent = '$' + currentPrice.toLocaleString();
    }, duration);
}

// Función de utilidad para copiar información
function copyInfo() {
    const info = `Publicidad - Combo Publicidad Completo por $100,000
    
Incluye:
1. Logo profesional
2. Publicidad para redes sociales
3. Video publicitario
4. Logo animado (intro)
5. Mockup de camiseta + archivo para estampar
6. Tarjetas y volantes listos para imprimir
7. Cuentas de redes sociales (Instagram, Facebook, WhatsApp Business)
8. Página web básica
+ BONUS: Capacitación para generar ventas

WhatsApp: +57 301 745 4361`;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(info).then(function() {
            showSwal({
                icon: 'success',
                title: '¡Copiado!',
                text: 'Información copiada al portapapeles',
                confirmButtonColor: '#4F46E5',
                timer: 2000,
                showConfirmButton: false
            });
        });
    } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement("textarea");
        textArea.value = info;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showSwal({
            icon: 'success',
            title: '¡Copiado!',
            text: 'Información copiada al portapapeles',
            confirmButtonColor: '#4F46E5',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

// Cerrar panel con tecla Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAdminPanel();
    }
});

// Cerrar panel al hacer clic fuera
document.getElementById('adminPanel').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAdminPanel();
    }
});

// === EFECTOS VISUALES MEJORADOS ===

// Efecto de scroll reveal
function initScrollReveal() {
    const reveals = document.querySelectorAll('.services h2, .how-it-works h2, .cta h2');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    reveals.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'all 0.8s ease';
        revealObserver.observe(el);
    });
}

// Efecto de parallax sutil
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        hero.style.transform = `translateY(${rate}px)`;
    });
}

// Efecto de cursor personalizado
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.cssText = `
        width: 20px;
        height: 20px;
        border: 2px solid #4F46E5;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.2s ease;
        backdrop-filter: blur(2px);
        background: rgba(79, 70, 229, 0.1);
    `;
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 10 + 'px';
        cursor.style.top = e.clientY - 10 + 'px';
    });
    
    // Expandir cursor en elementos interactivos
    const interactiveElements = document.querySelectorAll('button, a, .service-item, .step');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
            cursor.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
        });
    });
}

// Efecto de typing para el título principal
function initTypingEffect() {
    const title = document.querySelector('.hero-content h1');
    if (!title) return;
    
    const text = title.textContent;
    title.textContent = '';
    title.style.borderRight = '2px solid #FCD34D';
    
    let i = 0;
    const typeTimer = setInterval(() => {
        if (i < text.length) {
            title.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typeTimer);
            setTimeout(() => {
                title.style.borderRight = 'none';
            }, 1000);
        }
    }, 100);
}

// Efecto de contador animado para números
function animateCounters() {
    const counters = document.querySelectorAll('.service-number');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.textContent);
                
                if (target && !isNaN(target)) {
                    let count = 0;
                    const increment = target / 50;
                    
                    const timer = setInterval(() => {
                        count += increment;
                        if (count >= target) {
                            counter.textContent = target;
                            clearInterval(timer);
                        } else {
                            counter.textContent = Math.floor(count);
                        }
                    }, 30);
                }
                
                counterObserver.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Efecto de partículas flotantes
function createFloatingParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            animation: float 6s ease-in-out infinite;
            animation-delay: ${Math.random() * 6}s;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        
        hero.appendChild(particle);
    }
}

// CSS para las partículas flotantes
const particleStyles = document.createElement('style');
particleStyles.textContent = `
    @keyframes float {
        0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
        }
        50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
        }
    }
`;
document.head.appendChild(particleStyles);

// Inicializar todos los efectos visuales
function initVisualEffects() {
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
        initScrollReveal();
        initParallaxEffect();
        initCustomCursor();
        animateCounters();
        createFloatingParticles();
        
        // Efecto de typing solo en desktop
        if (window.innerWidth > 768) {
            setTimeout(initTypingEffect, 1000);
        }
    }, 100);
}

// Inicializar precio animado cuando la página carga
window.addEventListener('load', function() {
    setTimeout(animatePrice, 500);
});

// Funciones de utilidad para previsualizar medios
function previewMedia(url, type) {
    if (!url) return;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 20000;
        cursor: pointer;
    `;
    
    let content = '';
    const fileExt = url.split('.').pop().toLowerCase();
    
    if (['mp4', 'webm', 'ogg'].includes(fileExt)) {
        content = `<video controls style="max-width: 90%; max-height: 90%;"><source src="${url}"></video>`;
    } else {
        content = `<img src="${url}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
    }
    
    modal.innerHTML = content;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Mensaje de bienvenida en consola
console.log(`
🎨 Publicidad 
💰 Combo Publicidad Completo por $100,000
📱 WhatsApp: +57 301 745 4361
🌐 ¡Tu negocio merece destacar!

🔧 Panel de Administración disponible - Haz clic en el icono de configuración
`);

// Funciones globales para fácil acceso (actualizado)
window.contactWhatsApp = contactWhatsApp;
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.updateMedia = updateMedia;
window.updateAllMedia = updateAllMedia;
window.resetAllMedia = resetAllMedia;
window.copyInfo = copyInfo;
window.previewMedia = previewMedia; 

// Inicializar cuando la página carga
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar animaciones
    animateOnScroll();
    
    // Cargar medios guardados
    loadSavedMedia();
    
    // Efectos visuales mejorados
    initScrollReveal();
    initParallaxEffect();
    
    // Agregar smooth scroll al botón principal
    const mainBtn = document.querySelector('.btn-main');
    if (mainBtn) {
        mainBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('servicios').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
}); 
document.addEventListener('DOMContentLoaded', () => {
     if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
    }

    // Menú hamburguesa
    const menuBtn = document.querySelector('.menu-btn');
    const menu = document.querySelector('.menu');

    if (menuBtn && menu) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('abierto');
            menu.classList.toggle('abierto');
        });

        // Menú desplegable de secciones
        const enlacesMenu = menu.querySelectorAll('a');
        enlacesMenu.forEach(enlace => {
            enlace.addEventListener('click', () => {

                menuBtn.classList.remove('abierto');
                menu.classList.remove('abierto');
            });
        });
    }
    //Recorrido automático y flechas de carrusel
    const slides = document.querySelectorAll('.slide');
    const botonPrev = document.querySelector('.boton-slide:nth-child(1)');
    const botonNext = document.querySelector('.boton-slide:nth-child(3)');
    const contadorPantalla = document.querySelector('.slideshow__contador');
    let indexActual = 0;
    let intervaloSlideshow;

    function mostrarSlide(nuevoIndex) {
        if (slides.length === 0) return;
        slides[indexActual].classList.remove('activo');
        indexActual = (nuevoIndex + slides.length) % slides.length;
        slides[indexActual].classList.add('activo');
        
        if (contadorPantalla) {
            contadorPantalla.textContent = `${indexActual + 1} / ${slides.length}`;
        }
    }

    function iniciarAutoplay() {
        intervaloSlideshow = setInterval(() => {
            mostrarSlide(indexActual + 1);
        }, 4000);
    }

    function resetearAutoplay() {
        clearInterval(intervaloSlideshow);
        iniciarAutoplay();
    }

    if (slides.length > 0) {
        slides.forEach((s, i) => {
            s.style.display = 'block';
            if (i === 0) s.classList.add('activo');
            else s.classList.remove('activo');
        });
        iniciarAutoplay();

        if (botonPrev) {
            botonPrev.addEventListener('click', () => {
                mostrarSlide(indexActual - 1);
                resetearAutoplay();
            });
        }
        if (botonNext) {
            botonNext.addEventListener('click', () => {
                mostrarSlide(indexActual + 1);
                resetearAutoplay();
            });
        }
    }

    // Carrito de compras
    let carrito = [];
    const carritoContenedor = document.getElementById('carrito-seccion') || document.querySelector('.carrito-panel');
    
    // Contador del carrito
    const abrirCarritoBtn = document.querySelector('.carrito-icono') || [...document.querySelectorAll('span, a, button')].find(el => el.textContent.includes('🛒'));
    const cerrarCarritoBtn = document.getElementById('cerrar-carrito') || document.querySelector('.carrito-panel__cabecera button');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
    const procederPagoBtn = document.getElementById('proceder-pago');
    const carritoContador = document.querySelector('.carrito-alerta') || document.getElementById('carrito-contador');
    const carritoProductos = document.querySelector('.carrito-panel__lista') || document.getElementById('carrito-productos');
    const carritoPrecioTotal = document.querySelector('.total-caja span:last-child') || document.getElementById('carrito-precio-total');

    // Abrir Carrito con click
    if (abrirCarritoBtn && carritoContenedor) {
        abrirCarritoBtn.style.cursor = 'pointer';
        abrirCarritoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            carritoContenedor.classList.add('activo');
        });
    }

    // Cerrar Carrito con click
    if (cerrarCarritoBtn && carritoContenedor) {
        cerrarCarritoBtn.addEventListener('click', () => {
            carritoContenedor.classList.remove('activo');
        });
    }

    // Click en Añadir
    document.addEventListener('click', (e) => {
        if (e.target && (e.target.classList.contains('btn-agregar') || e.target.classList.contains('btn-agregar--mini') || e.target.textContent.trim() === 'Añadir')) {
            e.preventDefault();
            
            const tarjeta = e.target.closest('.tarjeta-disco') || e.target.closest('.reedicion-caja');
            if (!tarjeta) return;

            // Extraer título
            const titulo = tarjeta.querySelector('h3, h4')?.textContent.split('//')[0].trim() || 'Vinilo';
            const contenidoTexto = tarjeta.textContent;
            const coincidenciaPrecio = contenidoTexto.match(/(\d+[\.,]\d+)\s*€/);
            let precio = 30.00;
            
            if (coincidenciaPrecio) {
                precio = parseFloat(coincidenciaPrecio[1].replace(',', '.'));
            }

            const id = titulo.replace(/\s+/g, '-').toLowerCase();
            const productoExistente = carrito.find(item => item.id === id);

            // Límite de compra mismo producto
            if (productoExistente && productoExistente.cantidad >= 5) {
                alert(`¡Atención! Has alcanzado el límite máximo de 5 unidades para el álbum "${titulo}". En Track 01 Records limitamos las copias por cliente para evitar la especulación y garantizar que todos los coleccionistas tengan la oportunidad de conseguir su vinilo.`);
                return;
            }

            // Límite de compras general
            let unidadesTotalesActuales = carrito.reduce((sum, item) => sum + item.cantidad, 0);
            if (unidadesTotalesActuales >= 15) {
                alert('Límite de compra superado: El carrito permite un máximo de 15 vinilos en total por pedido.');
                return;
            }

            // Si se pasan ambos filtros
            if (productoExistente) {
                productoExistente.cantidad++;
            } else {
                carrito.push({ id, titulo, precio, cantidad: 1 });
            }

            // Actualiza los datos sin abrir la ventana
            actualizarInterfazCarrito();
        }
    });

    if (vaciarCarritoBtn) {
        vaciarCarritoBtn.addEventListener('click', () => {
            carrito = [];
            actualizarInterfazCarrito();
        });
    }

    function actualizarInterfazCarrito() {
        if (!carritoProductos) return;

        carritoProductos.innerHTML = '';
        let totalProductos = 0;
        let costeTotal = 0;

        if (carrito.length === 0) {
            carritoProductos.innerHTML = '<p class="carrito-vacio">El carrito está vacío</p>';
        } else {
            carrito.forEach(item => {
                totalProductos += item.cantidad;
                costeTotal += item.precio * item.cantidad;

                const elemento = document.createElement('div');
                elemento.className = 'carrito-item';
                elemento.style.marginBottom = '10px';
                elemento.innerHTML = `
                    <div class="carrito-item__detalles" style="flex: 1; color: #FFFFFF;">
                        <h4 style="font-size: 13px; margin: 0;">${item.titulo}</h4>
                        <p style="font-size: 11px; margin: 0; color: rgba(255,255,255,0.7);">${item.precio.toFixed(2)}€ x ${item.cantidad}</p>
                    </div>
                    <button class="btn-eliminar-item" data-id="${item.id}" style="background: none; border: none; color: #FF2E2E; font-size: 20px; cursor: pointer;">×</button>
                `;
                carritoProductos.appendChild(elemento);
            });
        }

        // Aviso de producto añadido
        if (carritoContador) {
            carritoContador.textContent = totalProductos;
            carritoContador.style.display = totalProductos > 0 ? 'flex' : 'none';
        }
        if (carritoPrecioTotal) {
            carritoPrecioTotal.textContent = `${costeTotal.toFixed(2)} €`;
        }

        const botonesEliminar = document.querySelectorAll('.btn-eliminar-item');
        botonesEliminar.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                carrito = carrito.filter(item => item.id !== id);
                actualizarInterfazCarrito();
            });
        });
    }

    // Panel de pago (carrito)
    const procederPagoBtnReal = document.getElementById('proceder-pago') || document.querySelector('.carrito-panel__pie button') || [...document.querySelectorAll('button')].find(el => el.textContent.includes('Proceder al pago'));
    const pagoSeccion = document.getElementById('caja-pago-seccion') || document.getElementById('pago-seccion') || document.querySelector('.pago-seccion');
    const cancelarPagoBtn = document.getElementById('cancelar-pago');
    const pagoFormulario = document.getElementById('pago-formulario');
    const pagoTotalCifra = document.getElementById('pago-total-cifra') || document.querySelector('.pago-total-cifra');

    if (procederPagoBtnReal && pagoSeccion && carritoContenedor) {
        procederPagoBtnReal.addEventListener('click', (e) => {
            e.preventDefault();
            if (carrito.length === 0) {
                alert('El carrito está vacío. Añade algún disco para comprar.');
                return;
            }
            // Calcular el total y poner el resultado
            let costeTotal = 0;
            carrito.forEach(item => { costeTotal += item.precio * item.cantidad; });
            if (pagoTotalCifra) pagoTotalCifra.textContent = `${costeTotal.toFixed(2)} €`;

            // Ocultar panel del carrito
            carritoContenedor.classList.remove('activo');
            pagoSeccion.style.display = 'flex';
        });
    }

    if (cancelarPagoBtn && pagoSeccion) {
        cancelarPagoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            pagoSeccion.style.display = 'none';
        });
    }

    if (pagoFormulario && pagoSeccion) {
        pagoFormulario.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Personalizar mensaje para usuario
            const nombreCliente = document.getElementById('pago-nombre')?.value || 'Coleccionista';
            
            alert(`¡Excelente elección, ${nombreCliente}!\n\nTu pedido en TRACK 02 ha sido procesado con éxito. Hemos enviado un correo electrónico de confirmación con los detalles del envío de tus vinilos.`);
            
            // Reiniciar estado del carrito después de la compra
            carrito = [];
            actualizarInterfazCarrito();
            pagoSeccion.style.display = 'none';
        });
    }

   // Botón para ver más productos
    const btnVerMas = document.getElementById('ver-mas-productos') || [...document.querySelectorAll('button, a')].find(el => el.textContent.includes('Ver más productos'));
    if (btnVerMas) {
        btnVerMas.addEventListener('click', (e) => {
            e.preventDefault();
            const productosOcultos = document.querySelectorAll('.catalogo-grid .tarjeta-disco--oculto');
            
            productosOcultos.forEach((prod) => {
                prod.classList.remove('tarjeta-disco--oculto');
            });
            
            //Efecto de desvanecer
            btnVerMas.style.opacity = '0';
            setTimeout(() => {
                btnVerMas.style.display = 'none';
            }, 300);
        });
    }


    // Acordeón e invitaciones
    const botonesAcordeon = document.querySelectorAll('.acordeon__titulo');
    botonesAcordeon.forEach(boton => {
        boton.addEventListener('click', () => {
            const contenido = boton.nextElementSibling;
            boton.classList.toggle('abierto');
            
            if (contenido) {
                contenido.style.display = contenido.style.display === 'block' ? 'none' : 'block';
            }

            botonesAcordeon.forEach(otroBoton => {
                if (otroBoton !== boton) {
                    otroBoton.classList.remove('abierto');
                    const otroContenido = otroBoton.nextElementSibling;
                    if (otroContenido) otroContenido.style.display = 'none';
                }
            });
        });
    });

    // Recopilación de datos formulario evento
    const modalEventos = document.getElementById('registro-evento-seccion');
    const cerrarModalEventosBtn = document.getElementById('cancelar-registro-evento');
    const inputEventoNombre = document.getElementById('evento-seleccionado-nombre');
    const formularioEventos = document.getElementById('formulario-registro-evento');
    const botonesInvitacion = document.querySelectorAll('.btn-evento');

    // Elegir evento y abrir formulario modal
    botonesInvitacion.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const acordeonItem = e.target.closest('.acordeon__item');
            const tituloEvento = acordeonItem.querySelector('.acordeon__titulo').textContent.replace(/[+−]/g, '').trim();
            
            // Nombre de evento
            if (inputEventoNombre) inputEventoNombre.value = tituloEvento;
            if (modalEventos) modalEventos.style.display = 'flex';
        });
    });

    // Cerrar modal invitaciones
    if (cerrarModalEventosBtn && modalEventos) {
        cerrarModalEventosBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalEventos.style.display = 'none';
        });
    }

    // Confirmar el envío del formulario de eventos 
    if (formularioEventos && modalEventos) {
        formularioEventos.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const asistente = document.getElementById('registro-nombre')?.value || 'Asistente';
            const evento = inputEventoNombre?.value || 'nuestro evento';
            const pases = document.getElementById('registro-pases')?.value || '1';
            
            alert(`¡Reserva confirmada, ${asistente}!\n\nHas asegurado con éxito ${pases} invitación(es) gratuita(s) para:\n"${evento}" en nuestra tienda de Madrid. Te hemos enviado un código QR de acceso a tu correo.`);
            
            formularioEventos.reset();
            modalEventos.style.display = 'none';
        });
    }
    // 7. Carrusel fotos de la tienda
    const slidesTienda = document.querySelectorAll('.slide-tienda');
    const btnTiendaAnt = document.querySelector('.btn-tienda-ant');
    const btnTiendaSig = document.querySelector('.btn-tienda-sig');
    const contadorTienda = document.querySelector('.slideshow-tienda__contador');
    let indexTienda = 0;
    let intervaloTienda;

    function mostrarSlideTienda(nuevoIndex) {
        if (slidesTienda.length === 0) return;
        
        slidesTienda[indexTienda].classList.remove('activo');
        slidesTienda[indexTienda].style.display = 'none';
        
        indexTienda = (nuevoIndex + slidesTienda.length) % slidesTienda.length;
        
        slidesTienda[indexTienda].style.display = 'block';
        void slidesTienda[indexTienda].offsetWidth; 
        slidesTienda[indexTienda].classList.add('activo');
        
        if (contadorTienda) {
            contadorTienda.textContent = `${indexTienda + 1} / ${slidesTienda.length}`;
        }
    }

    function iniciarAutoplayTienda() {
        intervaloTienda = setInterval(() => {
            mostrarSlideTienda(indexTienda + 1);
        }, 4000);
    }

    function resetearAutoplayTienda() {
        clearInterval(intervaloTienda);
        iniciarAutoplayTienda();
    }

    if (slidesTienda.length > 0) {
        slidesTienda.forEach((slide, i) => {
            if (i === 0) {
                slide.style.display = 'block';
                slide.classList.add('activo');
            } else {
                slide.style.display = 'none';
                slide.classList.remove('activo');
            }
        });
        
        iniciarAutoplayTienda();

        if (btnTiendaAnt) {
            btnTiendaAnt.addEventListener('click', (e) => {
                e.preventDefault();
                mostrarSlideTienda(indexTienda - 1);
                resetearAutoplayTienda();
            });
        }

        if (btnTiendaSig) {
            btnTiendaSig.addEventListener('click', (e) => {
                e.preventDefault();
                mostrarSlideTienda(indexTienda + 1);
                resetearAutoplayTienda();
            });
        }
    }
    // 8. Modal personalizado al hacer click en portadas
    const modalDisco = document.getElementById('modal-confirmar-disco');
    const modalDiscoImg = document.getElementById('modal-disco-img');
    const modalDiscoTitulo = document.getElementById('modal-disco-titulo');
    const modalDiscoAlbum = document.getElementById('modal-disco-album');
    const modalDiscoPrecio = document.getElementById('modal-disco-precio');
    const btnConfirmarDisco = document.getElementById('btn-confirmar-disco');
    const btnCancelarDisco = document.getElementById('btn-cancelar-disco');
    const cerrarModalDisco = document.getElementById('cerrar-modal-disco');
    let botonAgregarPendiente = null;

    document.addEventListener('click', (e) => {
        const marco = e.target.closest('.tarjeta-disco__marco') || e.target.closest('.reedicion-caja__marco');
        if (!marco) return;

        const tarjeta = marco.closest('.tarjeta-disco') || marco.closest('.reedicion-caja');
        const imgSrc = tarjeta.querySelector('img')?.src || '';
        const titulo = tarjeta.querySelector('h3, h4')?.textContent.trim() || 'Vinilo';
        const album = tarjeta.querySelector('.album, p')?.textContent.trim() || '';
        const coincidenciaPrecio = tarjeta.textContent.match(/(\d+[\.,]\d+)\s*€/);
        const precioTexto = coincidenciaPrecio ? `${coincidenciaPrecio[1]} €` : '30.00 €';

        // Rellenar datos en la ventana modal
        if (modalDiscoImg) modalDiscoImg.src = imgSrc;
        if (modalDiscoTitulo) modalDiscoTitulo.textContent = titulo;
        if (modalDiscoAlbum) modalDiscoAlbum.textContent = album;
        if (modalDiscoPrecio) modalDiscoPrecio.textContent = precioTexto;

        // Guardar referencia
        botonAgregarPendiente = tarjeta.querySelector('.btn-agregar, .btn-agregar--mini');

        if (modalDisco) modalDisco.style.display = 'flex';
    });

    // Confirmar y añadir al carrito
    if (btnConfirmarDisco) {
        btnConfirmarDisco.addEventListener('click', () => {
            if (botonAgregarPendiente) {
                botonAgregarPendiente.click();
            }
            if (modalDisco) modalDisco.style.display = 'none';
        });
    }

    // Cerrar sin añadir
    [btnCancelarDisco, cerrarModalDisco].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (modalDisco) modalDisco.style.display = 'none';
            });
        }
    });
    // 9. Filtros y slider catálogo
    const tarjetasCatalogo = document.querySelectorAll('#catalogo-seccion .tarjeta-disco');
    const botonesCategoria = document.querySelectorAll('.btn-filtro');
    const inputBuscador = document.getElementById('buscador-disco');
    let categoriaActual = 'todos';
    let precioMin = 20;
    let precioMax = 45;

    function obtenerGeneroDisco(texto) {
        const t = texto.toLowerCase();
        if (t.includes('soda') || t.includes('cerati') || t.includes('camilo') || t.includes('serrat') || t.includes('systema') || t.includes('aterciopelados') || t.includes('1280')) return 'espanol';
        if (t.includes('judas') || t.includes('chevelle') || t.includes('nirvana') || t.includes('clash') || t.includes('stereomud') || t.includes('five iron')) return 'metal';
        if (t.includes('michael') || t.includes('fugees') || t.includes('sixpence')) return 'pop';
        return 'rock';
    }

    function aplicarFiltros() {
        const textoBusqueda = inputBuscador ? inputBuscador.value.toLowerCase().trim() : '';
        const hayFiltroActivo = categoriaActual !== 'todos' || textoBusqueda !== '' || precioMin > 20 || precioMax < 45;
        const gridCatalogo = document.querySelector('#catalogo-seccion .catalogo-grid') || document.querySelectorAll('.catalogo-grid').at(-1);

        if (hayFiltroActivo && btnVerMas && btnVerMas.style.display !== 'none') {
            tarjetasCatalogo.forEach(t => t.classList.remove('tarjeta-disco--oculto'));
            btnVerMas.style.display = 'none';
        }

        let visibles = 0;

        tarjetasCatalogo.forEach(tarjeta => {
            const textoTarjeta = tarjeta.textContent.toLowerCase();
            const genero = obtenerGeneroDisco(textoTarjeta);
            const matchPrecio = textoTarjeta.match(/(\d+[\.,]\d+)\s*€/);
            const precio = matchPrecio ? parseFloat(matchPrecio[1].replace(',', '.')) : 30;

            const cumpleCategoria = (categoriaActual === 'todos') || (genero === categoriaActual);
            const cumpleTexto = textoTarjeta.includes(textoBusqueda);
            const cumplePrecio = (precio >= precioMin && precio <= precioMax);

            if (cumpleCategoria && cumpleTexto && cumplePrecio) {
                visibles++;
                if (tarjeta.style.display === 'none') {
                    tarjeta.style.display = 'flex';
                    tarjeta.classList.remove('tarjeta-disco--animar');
                    void tarjeta.offsetWidth;
                    tarjeta.classList.add('tarjeta-disco--animar');
                }
            } else {
                tarjeta.style.display = 'none';
                tarjeta.classList.remove('tarjeta-disco--animar');
            }
        });

        // Aviso de Sin resultados
        let avisoVacio = document.getElementById('mensaje-sin-resultados');
        if (visibles === 0 && gridCatalogo) {
            if (!avisoVacio) {
                avisoVacio = document.createElement('div');
                avisoVacio.id = 'mensaje-sin-resultados';
                avisoVacio.className = 'sin-resultados';
                avisoVacio.innerHTML = '<p>No hay productos que cumplan con el criterio de búsqueda.</p>';
                gridCatalogo.appendChild(avisoVacio);
            }
            avisoVacio.style.display = 'block';
        } else if (avisoVacio) {
            avisoVacio.style.display = 'none';
        }
    }

    botonesCategoria.forEach(btn => {
        btn.addEventListener('click', () => {
            botonesCategoria.forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            categoriaActual = btn.getAttribute('data-categoria');
            aplicarFiltros();
        });
    });

    if (inputBuscador) {
        inputBuscador.addEventListener('input', aplicarFiltros);
    }

    if (typeof $ !== 'undefined' && $.fn.slider) {
        $("#slider-precio").slider({
            range: true,
            min: 20,
            max: 45,
            values: new Array(20, 45),
            slide: function(event, ui) {
                precioMin = ui.values[0];
                precioMax = ui.values[1];
                $("#rango-precio-texto").text(`${precioMin} € - ${precioMax} €`);
                aplicarFiltros();
            }
        });
    }
});

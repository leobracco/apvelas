$(document).ready(function() {
    const endpoint = "/getProducts";

    $.getJSON(endpoint, function(entries) {
        if (!entries) {
            console.error("Datos no recibidos correctamente del servidor.");
            return;
        }

        entries.forEach(entry => {
            const { producto, fragancia,stock,precio: precioRaw, categoriaProducto, urlImagen, urlImagen1, urlImagen2, urlImagen3, urlImagen4 } = entry;
            let precio = parseFloat(precioRaw); 
            let imagenes = [urlImagen, urlImagen1, urlImagen2, urlImagen3, urlImagen4].filter(Boolean);

            let productoHtml = '';
           imagenes.forEach(imgUrl => {
    if (stock <= 0) { 
        productoHtml += `
            <div class="col-md-2 ${categoriaProducto} item-galeria " data-categoria="${categoriaProducto}">
                <div class="imagen-contenedor">
                    <img src="/getCompressedImage?imageURL=${imgUrl}" class="rounded shadow img-fluid" alt="${producto}">
                    <div class="producto-overlay">
                        <p class="producto-nombre">${producto} - ${fragancia} </p>
                        <p class="precio">$${precio}</p>
                        <button onclick="mostrarModalSinStock()" class="btn btn-danger">Sin stock</button>
                    </div>
                </div>
            </div>`;
    } else {
        productoHtml += `
            <div class="col-md-2 ${categoriaProducto} item-galeria "  data-categoria="${categoriaProducto}">
                <div class="imagen-contenedor">
                    <img src="/getCompressedImage?imageURL=${imgUrl}" class="rounded shadow img-fluid" alt="${producto}">
                    <div class="producto-overlay">
                        <p class="producto-nombre">${producto} - ${fragancia} </p>
                        <p class="precio">$${precio}</p>
                        <button onclick="agregarAlCarrito('${producto}','${fragancia}', ${precio}, '/getCompressedImage?imageURL=${imgUrl}')" class="btn btn-primary agregar-carrito">Agregar al carrito</button>
                    </div>
                </div>
            </div>`;
    }
});

            $("#ProductosContenedor").append(productoHtml);
        });
    });
});



let carrito = [];



function agregarAlCarrito(producto,fragancia,precio, imgUrl) {
    let item = carrito.find(item => item.producto === producto && item.fragancia ===fragancia);
    if (item) {
        item.cantidad++;
    } else {
        carrito.push({ producto: producto,fragancia:fragancia, precio: precio, cantidad: 1, imagen: imgUrl });
    }
    actualizarCarrito();

    // Mostrar el modal
    $('#productAddedModal').modal('show');
}


function actualizarCarrito() {
    let contenidoCarrito = '';
    let total = 0;
    carrito.forEach(item => {
        total += item.precio * item.cantidad;
        contenidoCarrito += `<div class="carrito-item">
                                <img src="${item.imagen}" alt="${item.producto}" width="50">
                                <p>${item.producto} - ${item.fragancia}: ${item.cantidad} x $${item.precio} = $${item.cantidad * item.precio}</p>
                                <button onclick="eliminarDelCarrito('${item.producto}','${item.fragancia}')">Eliminar</button>
                             </div>`;
    });
    contenidoCarrito += `<strong>Total: $${total}</strong>`;
    $('#contenidoCarrito').html(contenidoCarrito);
}



function enviarPedidoPorWhatsApp() {
    let mensaje = "Hola, me gustaría hacer un pedido:\n";
    carrito.forEach(item => {
        mensaje += `${item.producto} - ${item.fragancia}: ${item.cantidad} x $${item.precio} = $${item.cantidad * item.precio}\n`;
    });
    let total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    mensaje += `Total: $${total}\nGracias!`;

    let urlWhatsApp = `https://api.whatsapp.com/send?phone=CHANGENUMBER&text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp);
}

function eliminarDelCarrito(productoName, productoFragancia) {
    console.log(productoName + "-" + productoFragancia);
    carrito = carrito.filter(item => !(item.producto === productoName && item.fragancia === productoFragancia));
    actualizarCarrito();
}

$(document).ready(function() {
    $("#verCarritoLink").click(function(e) {
        e.preventDefault();
        $('#carritoModal').modal('show');
    });
	$("#irAlCarrito").click(function(e) {
        e.preventDefault();
		$('#productAddedModal').modal('hide');
        $('#carritoModal').modal('show');
    });
});
function mostrarModalSinStock() {
    $('#modalSinStock').modal('show');
}
// Cuando el usuario hace scroll, ejecutar la función showButton
window.onscroll = function() {showButton()};

function showButton() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        document.getElementById("btnTop").style.display = "block";
    } else {
        document.getElementById("btnTop").style.display = "none";
    }
}

// Al hacer clic en el botón, se regresa a la parte superior del documento
function topFunction() {
    document.body.scrollTop = 0; // Para Safari
    document.documentElement.scrollTop = 0; // Para Chrome, Firefox, IE y Opera
}

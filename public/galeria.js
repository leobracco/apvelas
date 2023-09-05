$(document).ready(function() {
    $.getJSON('/isAuthenticated', function(data) {
        if (!data.authenticated) {
            // Si el usuario no está autenticado, oculta el formulario y muestra un mensaje
            $('#uploadContainer').html('<p>Debes <a href="/login.html">iniciar sesión</a> para subir imágenes.</p>');
        }
    });
    $("#uploadForm").on('submit', function(e) {
        e.preventDefault();
        let formData = new FormData(this);
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: formData,
            contentType: false,
            cache: false,
            processData: false,
            success: function(data) {
                alert('Imagen subida correctamente.');
                loadImages();
            },
            error: function(error) {
                alert('Error al subir la imagen.');
            }
        });
    });

   

    loadImages(); // Llamar al cargar la página
});
 function loadImages() {
        $.getJSON("/uploadedImages", function(images) {
            console.log(images); // <--- Agregar esto.
            $('#imagesList').empty();
            if (Array.isArray(images)) { // Verifica si realmente es un array
                images.forEach(image => {
                    $('#imagesList').append(`
    <div class="col-md-3 text-center">
        <img src="/getCompressedImage?imageURL=${image.split('/').pop()}" alt="Imagen" class="img-thumbnail">
        <div class="input-group mt-2">
            <input type="text" value="${image.split('/').pop()}" readonly class="form-control">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary copy-btn" type="button">Copiar</button>
				<button class="btn btn-danger delete-btn" data-image-name="${image.split('/').pop()}" type="button">Borrar</button>
            </div>
        </div>
    </div>
`);


                });
            } else {
                console.error("No se recibió un array desde el servidor.");
            }
        });

    }
$(document).on('click', '.copy-btn', function() {
    let input = $(this).closest('.input-group').find('input');
    input.focus();
    input.select();
    document.execCommand('copy');
    
});
$(document).on('click', '.delete-btn', function() {
    let imageName = $(this).data('image-name');
    $.ajax({
        url: '/deleteImage',
        type: 'POST',
        data: {
            imageName: imageName
        },
        success: function(response) {
            alert('Imagen borrada correctamente.');
            loadImages();
        },
        error: function(error) {
            alert('Error al borrar la imagen.');
        }
    });
});
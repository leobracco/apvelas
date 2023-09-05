// 1. Importación de Módulos
const express = require('express');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const sharp = require('sharp');
// 2. Configuración
const app = express();
const PORT = 4003;
const users = [{
    id: 1,
    username: "admin",
    password: ""
}];




passport.use(new LocalStrategy((username, password, done) => {
    console.log('LocalStrategy llamado con:', username, password);
    const user = users.find(user => user.username === username);
    if (!user) {
        console.log('No se encontró el usuario:', username); // Log aquí
        return done(null, false);
    }

    if (bcrypt.compareSync(password, user.password)) {
        console.log('Autenticación exitosa para el usuario:', username); // Log aquí
        return done(null, user);
    } else {
        console.log('Contraseña incorrecta para el usuario:', username); // Log aquí
        return done(null, false);
    }
}));


passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    const user = users.find(user => user.id === id);
    done(null, user);
});

// 3. Middleware
app.use(express.static('public'));
app.use(session({
    secret: 'tuSecreto',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage
});

// 4. Funciones y Helpers
const fetchGoogleSheetData = async (sheetName) => {
    const response = await axios.get(`${sheetName}`);
    const csvData = response.data;

    let lines = csvData.split("\n");
    let headers = lines[0].split(",");
    let entries = [];

    for (let i = 1; i < lines.length; i++) {
        let obj = {};
        let currentline = lines[i].split(",");

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j].trim()] = currentline[j].trim();
        }

        entries.push(obj);
    }

    return entries;
};


app.get('/getCompressedImage', (req, res) => {
    const imageURL = "public/uploads/" + req.query.imageURL;

    if (!imageURL) {
        res.status(400).send("Por favor, proporcione una URL de imagen válida.");
        return;
    }

    const ext = imageURL.split('.').pop().toLowerCase();

    let compressionSettings;
    switch (ext) {
        case 'jpg':
		case 'JPG':
        case 'jpeg':
            compressionSettings = {
                type: 'jpeg',
                options: {
                    quality: 80
                }
            };
            break;
        case 'png':
            compressionSettings = {
                type: 'png',
                options: {}
            };
            break;
        case 'webp':
            compressionSettings = {
                type: 'webp',
                options: {
                    quality: 80
                }
            };
            break;
        default:
            res.status(400).send("Tipo de imagen no soportado.");
            return;
    }

    sharp(imageURL)
        .rotate()
        .resize(800)
        [compressionSettings.type](compressionSettings.options)
        .toBuffer((err, buffer, info) => {
            if (err) {
                res.status(500).send("Error al comprimir la imagen.");
                return;
            }

            res.setHeader('Content-Type', `image/${compressionSettings.type}`);
            res.send(buffer);
        });
});


function ensureAuthenticated(req, res, next) {
    console.log("Status:" + req.isAuthenticated())
    if (req.isAuthenticated()) {
        console.log("Status:" + req.isAuthenticated())
        return next();
    } else {
        console.log("Status:" + req.isAuthenticated())
        res.redirect('/login.html');
    }
}
// 5. Rutas
app.get('/isAuthenticated', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            authenticated: true
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

app.get('/upload.html', ensureAuthenticated, (req, res) => {
    console.log("Status:" + req.isAuthenticated())
    res.sendFile(path.join(__dirname, './public/upload.html'));
});
app.get('/getProducts', async (req, res) => {
    try {
        const entries = await fetchGoogleSheetData('https://docs.google.com/spreadsheets/d/e//pub?gid=0&single=true&output=csv');
        res.json(entries);
    } catch (error) {
        res.status(500).json({
            error: 'No se pudieron obtener los datos de los productos.'
        });
    }
});

app.get('/getAromas', async (req, res) => {
    try {
        const entries = await fetchGoogleSheetData('https://docs.google.com/spreadsheets/d/e//pub?gid=&single=true&output=csv');
        res.json(entries);
    } catch (error) {
        res.status(500).json({
            error: 'No se pudieron obtener los aromas.'
        });
    }
});

app.post('/upload', ensureAuthenticated, upload.array('imageFiles', 50), (req, res) => {
    if (req.files && req.files.length > 0) {
        const imageUrls = req.files.map(file => `uploads/${file.filename}`);
        res.json({
            imageUrls: imageUrls
        });
    } else {
        res.status(500).send('Error al subir las imágenes.');
    }
});


app.get('/uploadedImages', (req, res) => {
    const imagesDir = path.join(__dirname, './public/uploads');
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.json({
                error: 'Error al leer el directorio de imágenes.'
            });
        }
        let imagesArray = [];
        files.forEach(file => {
            imagesArray.push(`${file}`);
			console.log(`Nombre:${file}`);
        });
        res.json(imagesArray);
    });
});
app.get('/login', (req, res) => {
    console.log('Acceso a la ruta GET /login'); // Log cuando alguien accede a la ruta GET /login
    res.sendFile(path.join(__dirname, './public/login.html'));
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {

        if (err) {
            console.log('Error en passport.authenticate:', err);
            return next(err);
        }
        if (!user) {
            console.log('Fallo en la autenticación. Redirigiendo a /login');
            return res.redirect('/login');
        }
        req.logIn(user, (err) => {
            if (err) {
                console.log('Error en req.logIn:', err);
                return next(err);
            }
            console.log('Inicio de sesión exitoso. Redirigiendo a /upload.html');
            return res.redirect('/upload.html');
        });
    })(req, res, next);
});
app.post('/deleteImage', ensureAuthenticated, (req, res) => {
    const imageName = req.body.imageName;
    if (imageName) {
        fs.unlink(path.join(__dirname, `./public/uploads/${imageName}`), (err) => {
            if (err) {
                console.error(`Error al borrar la imagen ${imageName}:`, err);
                res.status(500).send('Error al borrar la imagen.');
            } else {
                res.send('Imagen borrada correctamente.');
            }
        });
    } else {
        res.status(400).send('Nombre de imagen no proporcionado.');
    }
});


// 6. Iniciar el Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
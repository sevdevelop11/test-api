const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const port = 3000;
const fs = require('fs');
const { createObjectCsvWriter } = require('csv-writer');


// URL de conexión a tu base de datos MongoDB Atlas
const uri = 'mongodb+srv://admin:F5rG5wfkSWGdbkVF@cluster0.lpeckui.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';


// Configuración del cliente de MongoDB
const client = new MongoClient(uri);

// Clave secreta para firmar y verificar los tokens JWT
const secretKey = 'D4@#JKL!^Gh92&*f3PqZ'

// Middleware para parsear el body de las solicitudes como JSON
app.use(express.json());

// Middleware para verificar el token JWT en las solicitudes
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Se requiere un token de autenticación.' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido.' });
        }
        req.usuario = decoded;
        next();
    });
}

// Endpoint para generar un token JWT
app.post('/api/login', async (req, res) => {

    try {
    // Obtener los datos del cuerpo de la solicitud
    const { user, password } = req.body;

    // Conectar al servidor de MongoDB
    await client.connect();

    // Seleccionar la base de datos y la colección de usuarios
    const database = client.db('mongodbVSCodePlaygroundDB');
    const collection = database.collection('users');

    // Buscar el usuario en la base de datos
    const usuarioEncontrado = await collection.findOne({ user });

    // Si el usuario no existe, devolver un mensaje de error
    if (!usuarioEncontrado) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    
    // Comparar la contraseña encriptada
    const contraseñaValida = await bcrypt.compare(password, usuarioEncontrado.password);

    // Si la contraseña no es válida, devolver un mensaje de error
    if (!contraseñaValida) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Generar el token JWT con el usuario
    const token = jwt.sign(usuarioEncontrado, secretKey, { expiresIn: '1h' });

    res.json({ token });
  }  catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
} finally {
    // Cerrar la conexión con la base de datos al finalizar
    await client.close();
}});

// Ruta POST para registrar un nuevo usuario
app.post('/api/register', async (req, res) => {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const { user, password } = req.body;

        // Conectar al servidor de MongoDB
        await client.connect();

        // Seleccionar la base de datos y la colección de usuarios
        const database = client.db('mongodbVSCodePlaygroundDB');
        const collection = database.collection('users');

        // Verificar si el usuario ya existe
        const usuarioExistente = await collection.findOne({ user });

        if (usuarioExistente) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Almacenar el nuevo usuario en la base de datos
        await collection.insertOne({ user, password: hashedPassword });

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        // Cerrar la conexión con la base de datos al finalizar
        await client.close();
    }
});

// Ruta POST para iniciar sesión
app.post('/login', async (req, res) => {
    try {
        // Obtener los datos del cuerpo de la solicitud
        const { usuario, contraseña } = req.body;

        // Conectar al servidor de MongoDB
        await client.connect();

        // Seleccionar la base de datos y la colección de usuarios
        const database = client.db('mongodbVSCodePlaygroundDB');
        const collection = database.collection('users');

        // Buscar el usuario en la base de datos
        const usuarioEncontrado = await collection.findOne({ usuario });

        // Si el usuario no existe, devolver un mensaje de error
        if (!usuarioEncontrado) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Comparar la contraseña encriptada
        const contraseñaValida = await bcrypt.compare(contraseña, usuarioEncontrado.contraseña);

        // Si la contraseña no es válida, devolver un mensaje de error
        if (!contraseñaValida) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        res.json({ message: 'Inicio de sesión exitoso' });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        // Cerrar la conexión con la base de datos al finalizar
        await client.close();
    }
});


// Definir el endpoint para encontrar el número mayor y menor
app.post('/api/findMinMax', verificarToken, (req, res) => {
    const numeros = req.body.numeros;
    if (!numeros || !Array.isArray(numeros)) {
        return res.status(400).json({ error: 'Se esperaba un array de números en el cuerpo de la solicitud.' });
    }

    if (numeros.length === 0) {
        return res.status(400).json({ error: 'El array de números está vacío.' });
    }

    let menor = mayor = numeros[0];
    for (let i = 1; i < numeros.length; i++) {
        if (numeros[i] < menor) {
            menor = numeros[i];
        } else if (numeros[i] > mayor) {
            mayor = numeros[i];
        }
    }

    res.json({ mayor, menor });
});

// Ruta POST para añadir un personaje a la base de datos
app.post('/api/character', verificarToken, async (req, res) => {
    try {
        // Conectar al servidor de MongoDB
        await client.connect();
        // Seleccionar la base de datos y la colección
        const database = client.db('mongodbVSCodePlaygroundDB');
        const collection = database.collection('personajes');
        // Insertar el nuevo personaje en la colección
        const result = await collection.insertOne(req.body);

        // Devolver una respuesta con el ID del personaje insertado
        res.status(201).json({ message: 'Personaje añadido correctamente', insertedId: result.insertedId });
    } catch (error) {
        console.error('Error al añadir personaje:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        // Cerrar la conexión con la base de datos al finalizar
        await client.close();
    }
});

// Ruta GET para buscar un personaje por nombre
app.get('/api/character/:nombre', verificarToken, async (req, res) => {
    const nombre = req.params.nombre;
    try {
        // Conectar al servidor de MongoDB
        await client.connect();

        // Seleccionar la base de datos y la colección
        const database = client.db('mongodbVSCodePlaygroundDB');
        const collection = database.collection('personajes');

        // Consultar el personaje por nombre en la colección
        const character = await collection.findOne({ nombre: nombre });

        // Si el personaje no se encuentra, devolver un mensaje de error
        if (!character) {
            return res.status(404).json({ message: 'Personaje no encontrado' });
        }

        // Devolver el personaje encontrado
        res.json(character);
    } catch (error) {
        console.error('Error al consultar personaje por nombre:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        // Cerrar la conexión con la base de datos al finalizar
        await client.close();
    }
});

// Ruta DELETE para borrar un personaje por nombre
app.delete('/api/character/:nombre', async (req, res) => {
    const nombre = req.params.nombre;
    try {
        // Conectar al servidor de MongoDB
        await client.connect();

        // Seleccionar la base de datos y la colección
        const database = client.db('mongodbVSCodePlaygroundDB');
        const collection = database.collection('personajes');

        // Borrar el personaje por nombre de la colección
        const result = await collection.deleteOne({ nombre: nombre });

        // Si no se encuentra ningún personaje para borrar, devolver un mensaje de error
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Personaje no encontrado' });
        }

        // Devolver un mensaje de éxito
        res.json({ message: 'Personaje borrado correctamente' });
    } catch (error) {
        console.error('Error al borrar personaje por nombre:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        // Cerrar la conexión con la base de datos al finalizar
        await client.close();
    }
});

app.get('/api/characters', verificarToken, async (req, res) => {
    try {
        // Conectar al servidor de MongoDB
        await client.connect();
        // Seleccionar la base de datos y la colección
        const database = client.db('mongodbVSCodePlaygroundDB');
        const collection = database.collection('personajes');
        // Insertar el nuevo personaje en la colección
        const result = await collection.find({}).toArray();
        // Devolver los personajes encontrados
        res.json(result);

    } catch (error) {
        console.error('Error al consultar los personajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        // Cerrar la conexión con la base de datos al finalizar
        await client.close();
    }
});

app.get('/api/charactersCSV', verificarToken, async (req, res) => {
    try {
        // Conectar al servidor de MongoDB
        await client.connect();

        // Seleccionar la base de datos y la colección de personajes
        const database = client.db('mongodbVSCodePlaygroundDB');
        const collection = database.collection('personajes');

        // Consultar todos los personajes en la colección
        const characters = await collection.find({}).toArray();
    // Exportar los personajes a un archivo CSV
    const csvFilePath = 'characters.csv';
    const csvWriter = createObjectCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'nombre', title: 'Nombre' },
            { id: 'raza', title: 'Raza' },
            { id: 'profesion', title: 'Profesión' },
            { id: 'nivel', title: 'Nivel' },
            { id: 'habilidades', title: 'Habilidades' },
            { id: 'equipo', title: 'Equipo' }
        ]
    });

    await csvWriter.writeRecords(characters);
    console.log('CSV file written to disk');
    res.download(csvFilePath); // Descargar el archivo CSV como respuesta
} catch (error) {
    console.error('Error al exportar personajes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
} finally {
    // Cerrar la conexión con la base de datos al finalizar
    await client.close();
}
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

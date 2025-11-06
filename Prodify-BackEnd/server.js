const express = require('express');
const app = express();

app.use(express.json());

// Api root endpoint 
app.get('/', (req, res) => {
  res.send('API on.');
});
const db = require('./firebase');

app.get('/FireBase', async (req, res) => {
  try {
    const snapshot = await db.collection('test').get();
    res.send("conected to Firebase ✅");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro one connecting to Firebase ❌");
  }
});


const authMiddleware = require('./authMiddleware');

// Endpoint projected that requires authentication
app.get('/perfil', authMiddleware, (req, res) => {
  res.send({
    message: "Token valid ✅",
    uid: req.user.uid,
    email: req.user.email,
    provider: req.user.firebase.sign_in_provider
  });
});





app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

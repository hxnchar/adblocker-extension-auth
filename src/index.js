import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import User from './models/user.model.js';
import { genTokenPair } from './utils/token.util.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  const path = req.url;
  if (path === '/register' || path === '/login') {
     return next();
  }
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.status(401).send('Access token required');
  }
  jwt.verify(token, 'secretkey', (error, decoded) => {
    if (error) {
      return res.status(401).send('Invalid access token');
    }
    req.userId = decoded.id;
    next();
  });
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    await user.save();
    return res.send(await genTokenPair(user));
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
      return res.status(404).send('User not found');
    }
    bcrypt.compare(req.body.password, user.password, async (error, result) => {
      if (error) {
        return res.status(500).send(error);
      }
      if (!result) {
        return res.status(401).send('Email or password are incorrect');
      }
      return res.send(await genTokenPair(user));
    });
  } catch (e) {
    return res.status(500).send(error);
  }
});

app.get('/refresh-token', async (req, res) => {
  try {
    const user = await User.findOne({refreshTokens: req.body.refreshToken});
    if (!user) {
      return res.status(401).send('Invalid refresh token');
    }
    return res.send(await genTokenPair(user));
  } catch (e) {
    return res.status(500).send(e.message);
  }
});

app.get('/protected', (req, res) => {
  User.findById(req.userId, (error, user) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(`Welcome, ${user.email}!`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

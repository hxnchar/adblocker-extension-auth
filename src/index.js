import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import User from './models/user.model.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/register', (req, res) => {
  bcrypt.hash(req.body.password, 10, (error, hashedPassword) => {
    if (error) {
      res.status(500).send(error);
    } else {
      const user = new User({
        email: req.body.email,
        password: hashedPassword
      });

      user.save((error) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.send('User successfully registered');
        }
      });
    }
  });
});

app.post('/login', (req, res) => {
  User.findOne({
    email: req.body.email
  }, (error, user) => {
    if (error) {
      res.status(500).send(error);
    } else if (!user) {
      res.status(404).send('Email or password are incorrect');
    } else {
      bcrypt.compare(req.body.password, user.password, (error, result) => {
        if (error) {
          res.status(500).send(error);
        } else if (!result) {
          res.status(401).send('Email or password are incorrect');
        } else {
          const token = jwt.sign({ id: user._id }, 'secretkey');

          res.send({ token });
        }
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
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

app.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    email: req.body.email,
    password: hashedPassword,
  });
  try {
    await user.save();
    return res.status(200).send('User created successfully');
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
  } catch (e) {
    res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
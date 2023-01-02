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
    const token = jwt.sign({ id: user._id }, 'secretkey');
    return res.send({ token });
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
        return res.status(500).send(error);
      }
      if (!result) {
        return res.status(401).send('Email or password are incorrect');
      }

      const token = jwt.sign({ id: user._id }, 'secretkey');
      return res.send({ token });
    });
  } catch (e) {
    return res.status(500).send(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
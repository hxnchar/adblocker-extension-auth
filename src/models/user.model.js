import mongoose from 'mongoose';

const User = mongoose.model('User', {
  email: { 'type': String, 'unique': true, 'required': true },
  password: { 'type': String, 'unique': false, 'required': true },
  refreshTokens: [{ 'type': String, 'unique': true }],
});

export default User;

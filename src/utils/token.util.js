import { v4 } from 'uuid';
import jwt from 'jsonwebtoken';

const genTokenPair = async (user) => {
  const accessToken = jwt.sign({ id: user._id }, 'secretkey');
  const refreshToken = v4();
  user.refreshTokens.push(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
}

export { genTokenPair }
import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import User from "../models/user.model.js";
import {
  authService,
  userService,
  tokenService,
  emailService,
} from "../services/index.js";

const { CREATED, NO_CONTENT } = httpStatus;

export const register = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Email and password are required" });
  }
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Email already exists" });
  }
  const newUser = await User.create({ email, password });

  const tokens = await tokenService.generateAuthTokens(newUser);
  res.status(CREATED).send({ user: newUser, tokens });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(NO_CONTENT).send();
});

export const refreshToken = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

export const gmailLogin = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await userService.getUserByEmail(email);
  if (!user) {
    const newUser = await userService.createUser({ email });
    const tokens = await tokenService.generateAuthTokens(newUser);
    res.send({ user: newUser, tokens });
  }
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

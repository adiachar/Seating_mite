import express from 'express';
import { signIn, signUp, StudentSignIn, StudentSignUp } from '../control/user.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/sign-in', (req, res) => signIn(req, res));
router.post('/sign-up', (req, res) => signUp(req, res));
router.post('/student/sign-in', (req, res) => StudentSignIn(req, res));
router.post('/student/sign-up', (req, res) => StudentSignUp(req, res));
router.post('/authorize', authMiddleware, (req, res) => {
    return res.status(200).json({message: "Authorized", user: req.user});
});

export default router;
import express from 'express';
import { check } from 'express-validator';
import { signUp, signin } from '../controllers/user_ctrl/user_ctrl.js';

const router = express.Router();

router.post('/signin',
    [
        check('email').isEmail()
            .withMessage('Please enter a valid email address'),
        check('password').trim().isLength({ min: 7 })
            .not()
            .isEmpty()
            .withMessage('Please enter a valid email address'),
    ], signin);

router.post('/signUp', [
    check('email').isEmail()
        .withMessage('Please enter a valid email address'),
    check('password').trim().isLength({ min: 7 })
        .not()
        .isEmpty()
        .withMessage('Please enter a valid email address'),
], signUp);







export default router;
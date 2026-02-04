const express = require("express");
const router = express.Router();
const guestController = require("../controllers/guestController");

/**
 * @swagger
 * tags:
 *   name: Guest
 *   description: Guest user OTP and report submission
 */

/**
 * @swagger
 * /api/guest/request-otp:
 *   post:
 *     summary: Request OTP for guest report submission
 *     tags: [Guest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - isGuest
 *             properties:
 *               email:
 *                 type: string
 *                 example: guest@example.com
 *               isGuest:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/request-otp", guestController.requestGuestOtp);

/**
 * @swagger
 * /api/guest/verify-otp:
 *   post:
 *     summary: Verify OTP for guest report submission
 *     tags: [Guest]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: guest@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully and guest token returned
 *       400:
 *         description: Invalid OTP or expired
 *       500:
 *         description: Internal server error
 */
router.post("/verify-otp", guestController.verifyGuestOtp);

module.exports = router;

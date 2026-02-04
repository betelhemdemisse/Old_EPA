const express = require("express");
const router = express.Router();
const {
  createCustomerAccount,
  verifyOTP,
  resendOTP,
  updateCustomer,
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
  deactivateUserAccount,
  activateUserAccount
} = require("../controllers/customerAccountController");
const {
  validateCreateCustomer,
  validateVerifyOTP,
  validateUpdateCustomer,
} = require("../validators/customerAccountValidator");
const { verifyToken } = require("../middleware/authMiddleware");

const multer = require("multer");
const { validateLogin } = require("../validators/authValidator");
const { validateCustomerAuth } = require("../validators/customerAuthValidator");
const customerAuthController = require("../controllers/customerAuthController");
const path = require("path")


/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer account management
 */

/**
 * @swagger
 * /api/customer-accounts:
 *   post:
 *     tags: [Customers]
 *     summary: Create a new customer account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               phone_number:
 *                 type: string
 *                 example: 251912345678
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *               confirm_password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       201:
 *         description: Customer account created successfully. OTP sent to email.
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/customer-accounts/verify-otp:
 *   post:
 *     tags: [Customers]
 *     summary: Verify OTP for customer registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully, account activated.
 *       400:
 *         description: Invalid OTP or OTP expired.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/customer-accounts/resend-otp:
 *   post:
 *     tags: [Customers]
 *     summary: Resend OTP for customer registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone_number:
 *                 type: string
 *                 example: +251912345678
 *     responses:
 *       200:
 *         description: OTP resent successfully.
 *       404:
 *         description: Customer not found.
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/customer-accounts/login:
 *   post:
 *     tags: [Customers]
 *     summary: Customer login using email number and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                  type: string
 *                  example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *              
 *     responses:
 *       200:
 *         description: Login successful, token returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: your.jwt.token.here
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/customer-accounts/update/{customer_id}:
 *   put:
 *     tags: [Customers]
 *     summary: Update customer profile or password
 *     description: >
 *       Update customer details. You may update the full name or change
 *       the password. Password change requires current_password.
 *     parameters:
 *       - name: customer_id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Michael Doe
 *               current_password:
 *                 type: string
 *                 example: OldPassword123
 *               new_password:
 *                 type: string
 *                 example: NewStrongPassword456
 *               confirm_password:
 *                 type: string
 *                 example: NewStrongPassword456
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       400:
 *         description: Validation error or incorrect password
 *       404:
 *         description: Customer not found
 */

/**
 * @swagger
 * /api/customer-accounts:
 *   get:
 *     tags: [Customers]
 *     summary: Get all customers
 *     responses:
 *       200:
 *         description: List of all customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   phone_number:
 *                     type: string
 *                     example: +251912345678
 *                   full_name:
 *                     type: string
 *                     example: John Doe
 *                   
 *                
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Get customer by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Customer ID to fetch
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Customer details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 phone_number:
 *                   type: string
 *                   example: +251912345678
 *                 full_name:
 *                   type: string
 *                   example: John Doe
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     tags: [Customers]
 *     summary: Delete a customer
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Customer ID to delete
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Server error
 */

router.post("/", validateCreateCustomer, createCustomerAccount);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", customerAuthController.login);
router.use(verifyToken);
router.post("/reset-password-request", customerAuthController.resetPasswordRequest);
router.post("/reset-password", customerAuthController.resetPassword);
// router.put("/update/:id", validateUpdateCustomer, updateCustomer);

router.put("/update/:customer_id", validateUpdateCustomer, updateCustomer);

router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.delete("/:id", deleteCustomer);
router.patch("/:customer_id/activate", activateUserAccount);
router.patch("/:customer_id/deactivate",deactivateUserAccount);

module.exports = router;

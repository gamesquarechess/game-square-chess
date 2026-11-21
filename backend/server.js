require('dotenv').config();
const dns = require('node:dns');

dns.setServers([
  '8.8.8.8',
  '1.1.1.1'
]);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(s => s.trim()) : true }));
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  fideId: { type: String, default: 'Unrated', trim: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['player', 'admin'], default: 'player' },
}, { timestamps: true });
const otpSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, default: "" },
  fideId: { type: String, default: "Unrated" },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },

  purpose: {
    type: String,
    enum: ["registration", "password-reset"],
    default: "registration"
  }
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  location: { type: String, required: true, trim: true },
  fee: { type: Number, required: true, min: 0 },
  players: { type: Number, default: 0, min: 0 },
  category: { type: String, default: 'Open' },
  description: { type: String, default: '' },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

const resultSchema = new mongoose.Schema({
  tournamentTitle: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  firstPlace: { type: String, required: true, trim: true },
  secondPlace: { type: String, default: '', trim: true },
  thirdPlace: { type: String, default: '', trim: true },
  publishedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const registrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  playerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  fideId: { type: String, default: 'Unrated' },
  ageGroup: { type: String, default: '' },
  tournamentTitle: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['paid'], default: 'paid' },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });
registrationSchema.index({ userId: 1, tournamentId: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);
const Result = mongoose.model('Result', resultSchema);
const Registration = mongoose.model('Registration', registrationSchema);

const sendToken = (user) => jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, phone: user.phone, fideId: user.fideId, role: user.role });

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Login required.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (_) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
  }
}
function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required.' });
  next();
}
const adminOnly = [authMiddleware, adminMiddleware];

function getMailer() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
}
async function sendRegistrationEmails(registration) {
  const mailer = getMailer();
  if (!mailer) return;
  const adminEmail = process.env.ADMIN_EMAIL;
  const tasks = [mailer.sendMail({
    from: process.env.EMAIL_USER,
    to: registration.email,
    subject: `Registration confirmed - ${registration.tournamentTitle}`,
    text: `Hello ${registration.playerName},\n\nYour payment of ₹${registration.amountPaid} was successful and your registration for ${registration.tournamentTitle} is confirmed.\nPayment ID: ${registration.razorpayPaymentId}\n\nGame Square Chess`,
  })];
  if (adminEmail) tasks.push(mailer.sendMail({
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `New tournament registration - ${registration.tournamentTitle}`,
    text: `Player: ${registration.playerName}\nEmail: ${registration.email}\nPhone: ${registration.phone}\nTournament: ${registration.tournamentTitle}\nAmount: ₹${registration.amountPaid}\nPayment ID: ${registration.razorpayPaymentId}`,
  }));
  await Promise.allSettled(tasks);
}

app.get('/', (_req, res) => res.json({ success: true, message: 'Game Square Chess API is running.' }));
app.get('/api/health', (_req, res) => res.json({ success: true, message: 'API is healthy.' }));

// Authentication
// SEND EMAIL OTP
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, fideId = "Unrated" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const hashedPassword = await bcrypt.hash(password, 12);

    await OTP.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        purpose: "registration",
        fideId,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const mailer = getMailer();

    if (!mailer) {
      await OTP.deleteOne({ email: normalizedEmail });

      return res.status(500).json({
        success: false,
        message: "Email service is not configured.",
      });
    }

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: normalizedEmail,
      subject: "Game Square Chess - Email Verification",
      html: `
        <div style="font-family:Arial;padding:25px">
          <h2>Welcome to Game Square Chess!</h2>
          <p>Hello ${name},</p>
          <p>Your email verification code is:</p>
          <h1 style="color:#d97706;letter-spacing:8px">${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
          <p>Please do not share this code with anyone.</p>
          <h3>Game Square Chess</h3>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Verification OTP sent to your email.",
      requiresVerification: true,
    });

  } catch (error) {
    console.error("Signup OTP error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send verification email.",
    });
  }
});
// RESEND EMAIL VERIFICATION OTP
app.post("/api/auth/resend-otp", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const pending = await OTP.findOne({ email });

    if (!pending) {
      return res.status(404).json({
        success: false,
        message: "Registration session not found. Please register again.",
      });
    }

    if (pending.expiresAt <= new Date()) {
      await OTP.deleteOne({ email });

      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const mailer = getMailer();

    if (!mailer) {
      return res.status(500).json({
        success: false,
        message: "Email service is not configured.",
      });
    }

    pending.otp = otp;
    pending.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    pending.attempts = 0;

    await pending.save();

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Game Square Chess - New Verification OTP",
      html: `
        <div style="font-family:Arial;padding:25px">
          <h2>Game Square Chess</h2>
          <p>Hello ${pending.name},</p>
          <p>Your new email verification OTP is:</p>
          <h1 style="color:#d97706;letter-spacing:8px">${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
          <p>Please do not share this code with anyone.</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "A new OTP has been sent to your email.",
    });

  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to resend OTP. Please try again.",
    });
  }
});
// VERIFY EMAIL OTP AND CREATE ACCOUNT
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

 const pending = await OTP.findOne({
  email: normalizedEmail,
  purpose: "registration",
  expiresAt: { $gt: new Date() },
});

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please register again.",
      });
    }

    if (pending.attempts >= 5) {
      await OTP.deleteOne({ email: normalizedEmail });

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please register again.",
      });
    }

    if (pending.otp !== String(otp).trim()) {
      pending.attempts += 1;
      await pending.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP. Please try again.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      await OTP.deleteOne({ email: normalizedEmail });

      return res.status(409).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    const role =
      process.env.ADMIN_EMAIL &&
      normalizedEmail === process.env.ADMIN_EMAIL.trim().toLowerCase()
        ? "admin"
        : "player";

    const user = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password,
      fideId: pending.fideId,
      role,
    });

    await OTP.deleteOne({ email: normalizedEmail });

    res.status(201).json({
      success: true,
      message: "Email verified and account created successfully.",
      token: sendToken(user),
      user: publicUser(user),
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    return res.json({ success: true, message: 'Login successful.', token: sendToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Unable to login.' });
  }
});
// FORGOT PASSWORD - SEND OTP
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const mailer = getMailer();

    if (!mailer) {
      return res.status(500).json({
        success: false,
        message: 'Email service is not configured.'
      });
    }

    await mailer.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Game Square Chess - Password Reset OTP',
      html: `
        <div style="font-family:Arial;padding:25px">
          <h2>Game Square Chess</h2>
          <p>Hello ${user.name},</p>
          <p>Your password reset OTP is:</p>
          <h1 style="color:#d97706;letter-spacing:8px">${otp}</h1>
          <p>This OTP expires in 10 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
        </div>
      `
    });

    await OTP.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        purpose: 'password-reset'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: 'Password reset OTP sent to your email.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to send password reset OTP.'
    });
  }
});
// RESET PASSWORD
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 6-digit OTP.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters.'
      });
    }

    const pending = await OTP.findOne({
      email,
      purpose: 'password-reset',
      expiresAt: { $gt: new Date() }
    });

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or invalid. Please request a new OTP.'
      });
    }

    if (pending.attempts >= 5) {
      await OTP.deleteOne({ _id: pending._id });

      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Request a new OTP.'
      });
    }

    if (pending.otp !== otp) {
      pending.attempts += 1;
      await pending.save();

      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP.'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      await OTP.deleteOne({ _id: pending._id });

      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    await user.save();

    await OTP.deleteOne({ _id: pending._id });

    return res.json({
      success: true,
      message: 'Password reset successfully. Please login.'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to reset password.'
    });
  }
});
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: publicUser(user) });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to load profile.' }); }
});

// Public tournament and result lists
app.get('/api/tournaments', async (_req, res) => {
  try {
    const tournaments = await Tournament.find({ isPublished: true }).sort({ date: 1 });
    res.json({ success: true, tournaments, data: tournaments });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to fetch tournaments.' }); }
});
app.get('/api/tournaments/:id', async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });
    res.json({ success: true, tournament });
  } catch (error) { res.status(400).json({ success: false, message: 'Invalid tournament ID.' }); }
});
app.post('/api/tournaments', ...adminOnly, async (req, res) => {
  try {
    const { title, date, location, fee, players, category, description } = req.body;
    if (!title || !date || !location || fee === undefined) return res.status(400).json({ success: false, message: 'Title, date, location and fee are required.' });
    const tournament = await Tournament.create({ title, date, location, fee: Number(fee), players: Number(players || 0), category, description, isPublished: true });
    res.status(201).json({ success: true, message: 'Tournament created successfully.', tournament });
  } catch (error) { console.error(error); res.status(400).json({ success: false, message: error.message || 'Unable to create tournament.' }); }
});
app.put('/api/tournaments/:id', ...adminOnly, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });
    res.json({ success: true, message: 'Tournament updated successfully.', tournament });
  } catch (error) { res.status(400).json({ success: false, message: error.message || 'Unable to update tournament.' }); }
});
app.delete('/api/tournaments/:id', ...adminOnly, async (req, res) => {
  try {
    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });
    res.json({ success: true, message: 'Tournament deleted successfully.' });
  } catch (error) { res.status(400).json({ success: false, message: 'Invalid tournament ID.' }); }
});

app.get('/api/results', async (_req, res) => {
  try { const results = await Result.find().sort({ date: -1, publishedAt: -1 }); res.json({ success: true, results, data: results }); }
  catch (error) { res.status(500).json({ success: false, message: 'Unable to fetch results.' }); }
});
app.post('/api/results', ...adminOnly, async (req, res) => {
  try {
    const { tournamentTitle, date, firstPlace, secondPlace = '', thirdPlace = '' } = req.body;
    if (!tournamentTitle || !date || !firstPlace) return res.status(400).json({ success: false, message: 'Tournament, date and first-place winner are required.' });
    const result = await Result.create({ tournamentTitle, date, firstPlace, secondPlace, thirdPlace });
    res.status(201).json({ success: true, message: 'Result published successfully.', result });
  } catch (error) { res.status(400).json({ success: false, message: error.message || 'Unable to publish result.' }); }
});
app.delete('/api/results/:id', ...adminOnly, async (req, res) => {
  try { const result = await Result.findByIdAndDelete(req.params.id); if (!result) return res.status(404).json({ success: false, message: 'Result not found.' }); res.json({ success: true, message: 'Result deleted successfully.' }); }
  catch (error) { res.status(400).json({ success: false, message: 'Invalid result ID.' }); }
});

// Razorpay checkout: amount is always taken from the saved tournament, never from the browser.
app.post('/api/create-order', authMiddleware, async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ success: false, message: 'Razorpay keys are not configured on the server.' });
    const { tournamentId } = req.body;
    if (!mongoose.isValidObjectId(tournamentId)) return res.status(400).json({ success: false, message: 'A valid tournament is required.' });
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament || !tournament.isPublished) return res.status(404).json({ success: false, message: 'Tournament not found or unavailable.' });
    const existing = await Registration.findOne({ userId: req.user.id, tournamentId });
    if (existing) return res.status(409).json({ success: false, message: 'You are already registered for this tournament.' });
    const amount = Math.round(Number(tournament.fee) * 100);
    if (!Number.isFinite(amount) || amount < 100) return res.status(400).json({ success: false, message: 'Tournament fee must be at least ₹1.' });
    const order = await razorpay.orders.create({ amount, currency: 'INR', receipt: `gsq_${Date.now()}`, notes: { userId: String(req.user.id), tournamentId: String(tournament._id) } });
    res.status(201).json({ success: true, keyId: process.env.RAZORPAY_KEY_ID, order, tournament: { id: tournament._id, title: tournament.title, fee: tournament.fee } });
  } catch (error) { console.error('Create order error:', error); res.status(500).json({ success: false, message: 'Unable to create payment order.' }); }
});

app.post('/api/verify-and-register', authMiddleware, async (req, res) => {
  try {
    if (!razorpay) return res.status(503).json({ success: false, message: 'Razorpay is not configured.' });
    const { tournamentId, playerName, email, phone, age, fideId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!tournamentId || !playerName || !email || !phone || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return res.status(400).json({ success: false, message: 'Missing registration or payment details.' });
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const received = Buffer.from(String(razorpay_signature));
    const expected = Buffer.from(expectedSignature);
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
    const [order, payment, tournament] = await Promise.all([
      razorpay.orders.fetch(razorpay_order_id),
      razorpay.payments.fetch(razorpay_payment_id),
      Tournament.findById(tournamentId),
    ]);
    if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found.' });
    if (order.id !== razorpay_order_id || order.notes?.userId !== String(req.user.id) || order.notes?.tournamentId !== String(tournament._id)) return res.status(400).json({ success: false, message: 'Payment order does not match this user or tournament.' });
    if (payment.order_id !== razorpay_order_id || payment.status !== 'captured' || order.status !== 'paid' || payment.amount !== order.amount || payment.currency !== 'INR' || payment.amount !== Math.round(Number(tournament.fee) * 100)) return res.status(400).json({ success: false, message: 'Payment is not captured or the amount does not match.' });
    const alreadyRegistered = await Registration.findOne({ userId: req.user.id, tournamentId });
    if (alreadyRegistered) return res.status(409).json({ success: false, message: 'You are already registered.' });
    const registration = await Registration.create({
      userId: req.user.id, tournamentId, playerName: String(playerName).trim(), email: String(email).trim().toLowerCase(), phone: String(phone).trim(),
      fideId: fideId || 'Unrated', ageGroup: age ? `Age: ${age}` : '', tournamentTitle: tournament.title,
      amountPaid: tournament.fee, razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, status: 'paid',
    });
    sendRegistrationEmails(registration).catch(err => console.error('Registration email error:', err));
    res.status(201).json({ success: true, message: 'Payment verified and tournament registration completed.', registration });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'This player is already registered for this tournament.' });
    console.error('Verify/register error:', error);
    res.status(500).json({ success: false, message: 'Unable to verify payment and save registration.' });
  }
});

app.get('/api/admin/registrations', ...adminOnly, async (_req, res) => {
  try { const registrations = await Registration.find().populate('userId', 'name email').populate('tournamentId', 'title date').sort({ registeredAt: -1 }); res.json({ success: true, registrations }); }
  catch (error) { res.status(500).json({ success: false, message: 'Unable to fetch registrations.' }); }
});
app.get('/api/registrations', ...adminOnly, async (_req, res) => {
  try { const registrations = await Registration.find().populate('userId', 'name email').populate('tournamentId', 'title date').sort({ registeredAt: -1 }); res.json({ success: true, registrations }); }
  catch (error) { res.status(500).json({ success: false, message: 'Unable to fetch registrations.' }); }
});

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET in backend .env');
  process.exit(1);
}
if (!MONGO_URI) {
  console.error('Missing MONGO_URI (or MONGO_URL) in backend .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Atlas connected successfully.');
    app.listen(PORT, () => console.log(`Game Square Chess API running at PORT ${PORT}`));
  })
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Tutor = require('../models/Tutor');
const validate = require('../middleware/validate');
const protect = require('../middleware/protect');
const { OAuth2Client } = require('google-auth-library');
const { sendEmail } = require('../utils/mailer'); // ✅ ADD THIS
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const {sendWatiTemplateMessage,sendWhatsAppMessage} = require("../utils/whatappWati")


const {
    studentRegisterSchema,
    studentLoginSchema,
    tutorRegisterSchema,
    tutorLoginSchema,
    googleLoginSchema
} = require('../validator/auth');

const router = express.Router();

// ============= HELPER FUNCTIONS =============

const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
};

// ✅ Welcome email function
const sendWelcomeEmail = async (email, name, role) => {
    try {
        await sendEmail({
            to: email,
            subject: `🎓 Welcome to Student-Tutor Platform!`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                  color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                                 color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎓 Welcome ${name}!</h1>
                        </div>
                        <div class="content">
                            <h2>Your ${role === 'student' ? 'Student' : 'Tutor'} Account is Ready!</h2>
                            <p>We're excited to have you join the Student-Tutor Platform community.</p>
                            
                            ${role === 'student' ? `
                                <h3>As a Student, you can:</h3>
                                <ul>
                                    <li>✅ Ask questions and get help from expert tutors</li>
                                    <li>🤖 Chat with AI assistant for instant answers</li>
                                    <li>📅 Book one-on-one sessions with tutors</li>
                                    <li>📚 Track your learning progress</li>
                                </ul>
                            ` : `
                                <h3>As a Tutor, you can:</h3>
                                <ul>
                                    <li>✅ Answer student questions in your subject</li>
                                    <li>📅 Set your availability for meetings</li>
                                    <li>🎓 Help students succeed in their studies</li>
                                    <li>💼 Build your tutoring portfolio</li>
                                </ul>
                            `}
                            
                            <div style="text-align: center;">
                                <a href="${process.env.CLIENT_URL}/login" class="button">
                                    Get Started Now
                                </a>
                            </div>
                            
                            <p style="margin-top: 30px; font-size: 14px; color: #666;">
                                <strong>Note:</strong> You can verify your email from your profile to unlock all features.
                            </p>
                        </div>
                        <div class="footer">
                            <p>© 2025 Student-Tutor Platform. All rights reserved.</p>
                            <p>If you didn't create this account, please ignore this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        });
        console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
        console.error('❌ Failed to send welcome email:', error);
        // Don't fail registration if email fails
    }
};

// ============= STUDENT ROUTES =============

router.post('/student/register', validate(studentRegisterSchema), async (req, res) => {
    try {
        const { name, email, password, phoneNumber, class: studentClass, college } = req.body;
        
        // Check existing
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered'
            });
        }

        const newStudent = new Student({
            name,
            email,
            password,
            phoneNumber,
            class: studentClass,
            college,
            authProvider: 'local',
            isVerified: false
        });

        await newStudent.save();

        // 📌 Send welcome WhatsApp template
        sendWatiTemplate(
            phoneNumber,
            "welcome_wati_v1",
            buildNamedParams({ name })
        );

        // // 📌 Send WhatsApp welcome template
        // sendWhatsAppMessage(phoneNumber);
        // sendWatiTemplateMessage(phoneNumber,name);
        // // 📌 Optional email
        // sendWelcomeEmail(email, name, 'student');

        // Generate Token
        const payload = { 
            user: { 
                id: newStudent._id, 
                role: 'student', 
                email: newStudent.email,
                isVerified: false
            } 
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        setTokenCookie(res, token);

        res.status(201).json({
            success: true,
            message: 'Student registered successfully! Welcome messages sent.',
            user: {
                id: newStudent._id,
                name: newStudent.name,
                email: newStudent.email,
                phoneNumber: newStudent.phoneNumber,
                role: 'student',
                isVerified: false,
                token
            }
        });

    } catch (err) {
        console.error('Error in student registration:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during student registration'
        });
    }
});


router.post('/student/login', validate(studentLoginSchema), async (req, res) => {
    try {
        let { email, password } = req.body;
        console.log('Student login attempt for email:', email);
        
        email = req.body.email.toLowerCase().trim();
        const student = await Student.findOne({ email });

        //const student = await Student.findOne({ email});
        console.log('Found student:', student);
        if (!student) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        
        const isMatch = await bcrypt.compare(password, student.password);
        console.log('Password match:', isMatch);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password',
                isMatch: false
            });
        }
        
        // Update last login
        student.lastLogin = new Date();
        await student.save();
        
        const payload = { 
            user: { 
                id: student._id, 
                role: 'student', 
                email: student.email,
                isVerified: student.isVerified || false
            } 
        };
        
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        setTokenCookie(res, token);
        
        res.json({
            success: true,
            message: 'Student logged in successfully',
            user: {
                id: student._id,
                name: student.name,
                email: student.email,
                class: student.class,
                role: 'student',
                isVerified: student.isVerified || false
            }
        });
        
    } catch (err) {
        console.error('Error in student login:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during student login'
        });
    }
});

// ============= TUTOR ROUTES =============

router.post('/tutor/register', validate(tutorRegisterSchema), async (req, res) => {
    try {
        const { name, email, password, phoneNumber, subject, college } = req.body;

        const existingTutor = await Tutor.findOne({ email });
        if (existingTutor) {
            return res.status(400).json({
                success: false,
                message: 'Email is already registered'
            });
        }

        const newTutor = new Tutor({
            name,
            email,
            password,
            phoneNumber,
            subject,
            college,
            authProvider: 'local',
            isVerified: false
        });

        await newTutor.save();

        // // 📌 Send WhatsApp welcome template
        // sendWhatsAppMessage(phoneNumber);
        // sendWatiTemplateMessage(phoneNumber,name);
        // // 📌 Optional email
        // sendWelcomeEmail(email, name, 'tutor');

        // JWT
        const payload = { 
            user: { 
                id: newTutor._id, 
                role: 'tutor', 
                email: newTutor.email,
                subject: newTutor.subject,
                isVerified: false
            } 
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        setTokenCookie(res, token);

        res.status(201).json({
            success: true,
            message: 'Tutor registered successfully! Welcome messages sent.',
            user: {
                id: newTutor._id,
                name: newTutor.name,
                email: newTutor.email,
                phoneNumber: newTutor.phoneNumber,
                subject: newTutor.subject,
                role: 'tutor',
                isVerified: false
            }
        });

    } catch (err) {
        console.error('Error in tutor registration:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during tutor registration'
        });
    }
});

    

router.post('/tutor/login', validate(tutorLoginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const tutor = await Tutor.findOne({ email });
        if (!tutor) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        const isMatch = await bcrypt.compare(password, tutor.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        
        // Update last login
        tutor.lastLogin = new Date();
        await tutor.save();
        
        const payload = { 
            user: { 
                id: tutor._id, 
                role: 'tutor', 
                email: tutor.email,
                subject: tutor.subject,
                isVerified: tutor.isVerified || false
            } 
        };
        
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        setTokenCookie(res, token);
        
        res.json({
            success: true,
            message: 'Tutor logged in successfully',
            user: {
                id: tutor._id,
                name: tutor.name,
                email: tutor.email,
                role: 'tutor',
                subject: tutor.subject,
                isVerified: tutor.isVerified || false
            }
        });
        
    } catch (err) {
        console.error('Error in tutor login:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during tutor login'
        });
    }
});

// ============= COMMON ROUTES =============

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// Get current user
router.get('/me', protect, async (req, res) => {
    try {
        let user;
        
        if (req.user.role === 'student') {
            user = await Student.findById(req.user.id).select('-password');
        } else {
            user = await Tutor.findById(req.user.id).select('-password');
        }
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: req.user.role,
                isVerified: user.isVerified || false,
                ...(req.user.role === 'tutor' && { subject: user.subject }),
                ...(req.user.role === 'student' && { class: user.class })
            }
        });
        
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({
            success: false,
            message: 'Server error fetching user data'
        });
    }
});

// ============= GOOGLE LOGIN =============

router.post('/google-login',validate(googleLoginSchema), async (req, res) => {
    try {
        const { token, role } = req.body;
        
        if (!token || !role) {
            return res.status(400).json({
                success: false,
                message: 'Token and role are required'
            });
        }
        
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const { email, name, picture, sub: googleId } = ticket.getPayload();
        
        // Check if user exists
        const Model = role === 'student' ? Student : Tutor;
        let user = await Model.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `No ${role} account found with this email. Please register first.`,
                hint: 'registration_required'
            });
        }
        
        // Link Google account if not already linked
        let wasLinked = false;
        if (!user.googleId) {
            user.googleId = googleId;
            user.profilePicture = picture;
            user.authProvider = user.authProvider === 'local' ? 'both' : 'google';
            wasLinked = true;
            console.log(`🔗 Linked Google account for ${role}:`, email);
        }
        
        user.lastLogin = new Date();
        await user.save();
        
        // Create JWT token
        const jwtToken = jwt.sign(
            {
                user: {
                    id: user._id,
                    role,
                    email: user.email,
                    isVerified: user.isVerified || false,
                    ...(role === 'tutor' && { subject: user.subject })
                }
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        setTokenCookie(res, jwtToken);
        
        res.json({
            success: true,
            message: wasLinked
                ? 'Google account linked successfully!'
                : 'Login successful',
            wasLinked,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                role,
                authProvider: user.authProvider,
                isVerified: user.isVerified || false,
                ...(role === 'tutor' && { subject: user.subject })
            }
        });
        
    } catch (error) {
        console.error('❌ Google login error:', error);
        
        if (error.message?.includes('Token used too late')) {
            return res.status(400).json({
                success: false,
                message: 'Google token expired. Please try again.'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Google authentication failed. Please try again.'
        });
    }
});

module.exports = router;

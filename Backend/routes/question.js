const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Question = require('../models/Question');
const protect = require('../middleware/protect');
const upload = require('../middleware/upload');

// Get all questions for a student (separated by answered/unanswered)
router.get('/student/my-questions', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access this' });
    }

    const unansweredQuestions = await Question.find({ 
      studentId: req.user.id,
      isAnswered: false
    })
      .populate('answeredBy', 'name subject')
      .sort({ createdAt: -1 });

    const answeredQuestions = await Question.find({ 
      studentId: req.user.id,
      isAnswered: true
    })
      .populate('answeredBy', 'name subject')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      unansweredQuestions,
      answeredQuestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new question with optional multiple images
router.post('/', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can post questions' });
    }

    const { subject, questionText } = req.body;

    // Get uploaded image paths
    const imagePaths = req.files ? req.files.map(file => `/uploads/questions/${file.filename}`) : [];

    const question = new Question({
      studentId: req.user.id,
      subject,
      questionText,
      questionImages: imagePaths,
      isBeingAnswered: false,
      isAnswered: false
    });

    await question.save();

    // Populate student info
    await question.populate('studentId', 'name class college');

    // Get io instance and emit real-time event
    const io = req.app.get('io');
    io.to('tutors').emit('new-question', {
      question,
      message: 'New question posted!'
    });

    res.status(201).json({ success: true, question });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available questions for tutors (filtered by subject)
router.get('/tutor/available', protect, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ success: false, message: 'Only tutors can access this' });
    }

    const questions = await Question.find({
      subject: req.user.subject,
      isAnswered: false,
      isBeingAnswered: false
    })
      .populate('studentId', 'name class college')
      .sort({ createdAt: -1 });

    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Tutor claims a question
router.patch('/:id/claim', protect, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ success: false, message: 'Only tutors can claim questions' });
    }
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Not found' });
    if (question.isBeingAnswered || question.isAnswered) {
      return res.status(400).json({ success: false, message: 'Already claimed or answered' });
    }
    question.isBeingAnswered = true;
    question.answeredBy = req.user.id;
    question.claimedAt = new Date();
    await question.save();

    // Real-time update
    const io = req.app.get('io');
    io.to('tutors').emit('claimed-question', { questionId: question._id });

    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Tutor submits an answer
// Tutor submits an answer with optional images
router.post('/:id/answer', protect, upload.array('answerImages', 10), async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ success: false, message: 'Only tutors can submit answers' });
    }

    const { answerText } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    if (!question.isBeingAnswered || String(question.answeredBy) !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You have not claimed this question' });
    }

    // Get uploaded answer image paths
    const answerImagePaths = req.files ? req.files.map(file => `/uploads/questions/${file.filename}`) : [];

    // Update question
    question.isAnswered = true;
    question.isBeingAnswered = false;
    question.answerText = answerText;
    question.answerImages = answerImagePaths; // ✅ Save answer images
    question.answeredAt = new Date();

    await question.save();

    // Populate for response
    await question.populate('answeredBy', 'name subject');

    // Real-time update
    const io = req.app.get('io');
    io.emit('question-answered', { 
      questionId: question._id,
      studentId: question.studentId
    });

    res.json({ success: true, question });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});



// Get tutor's answered questions
router.get('/tutor/my-answered', protect, async (req, res) => {
  try {
    if (req.user.role !== 'tutor') {
      return res.status(403).json({ success: false, message: 'Only tutors' });
    }
    
    const tutorId = req.user.id || req.user._id;
    console.log('Tutor ID:', tutorId);
    
    const questions = await Question.find({ 
      answeredBy: tutorId,
      isAnswered: true 
    }).populate('studentId', 'name email class').sort({ answeredAt: -1 });
    
    console.log('Found:', questions.length);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});




module.exports = router;

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: {
      values: ['Maths', 'Computer Science', 'DSA', 'Development', 'MERN', 'Spring Boot'],
      message: '{VALUE} is not a valid subject'
    }
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  questionImages: [{
    type: String
  }],
  isBeingAnswered: {
    type: Boolean,
    default: false
  },
  answeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    default: null
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  claimedAt: {
    type: Date,
    default: null
  },
  answerText: {
    type: String,
    default: null
  },
  answerImages: [{ // ✅ Add this
    type: String
  }],
  answeredAt: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

questionSchema.index({ subject: 1, isAnswered: 1, isBeingAnswered: 1 });

module.exports = mongoose.model('Question', questionSchema);

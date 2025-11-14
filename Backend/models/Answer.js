const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: [true, 'Tutor ID is required']
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID is required']
  },
  answerIntro: {
    type: String,
    required: [true, 'Answer introduction is required'],
    trim: true
  },
  answerImages: [{
    type: String
  }],
  answerConclusion: {
    type: String,
    required: [true, 'Answer conclusion is required'],
    trim: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Answer', answerSchema);

const Joi = require('joi');

// Create Question (multipart form, so validate non-file fields)
const createQuestionSchema = Joi.object({
  subject: Joi.string().valid('Maths', 'Computer Science', 'DSA', 'Development', 'MERN', 'Spring Boot').required(),
  questionText: Joi.string().min(10).max(1000).required()
  // questionImage is handled by multer
});

// Claim Question (just needs question ID in params, no body validation needed)

module.exports = {
  createQuestionSchema
};

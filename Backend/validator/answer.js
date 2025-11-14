const Joi = require('joi');

const createAnswerSchema = Joi.object({
  answerIntro: Joi.string().min(10).max(500).required(),
  answerConclusion: Joi.string().min(10).max(500).required()
  // answerImages handled by multer
});

module.exports = {
  createAnswerSchema
};

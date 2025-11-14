const Joi = require('joi');

const bookMeetingSchema = Joi.object({
  tutorId: Joi.string().hex().length(24).required(), // MongoDB ObjectId
  slotId: Joi.number().integer().min(0).required(),
  subject: Joi.string().valid('Maths', 'Computer Science', 'DSA', 'Development', 'MERN', 'Spring Boot').required()
});

const setAvailabilitySchema = Joi.object({
  availability: Joi.array().items(
    Joi.object({
      day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(), // HH:MM format
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      meetLink: Joi.string().uri().required()
    })
  ).min(1).required()
});

module.exports = {
  bookMeetingSchema,
  setAvailabilitySchema
};

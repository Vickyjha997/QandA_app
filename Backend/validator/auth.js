const Joi = require('joi');

// ============= STUDENT VALIDATION SCHEMAS =============

// Student Registration
const studentRegisterSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),
        phoneNumber: Joi.string()
  .pattern(/^\+[1-9]\d{7,14}$/)
  .required()
  .messages({
      "string.pattern.base": "Phone number must be in E.164 format e.g., +919876543210",
      "any.required": "Phone number is required"
  }),
    
    email: Joi.string()
        .email({ tlds: { allow: false } }) // Allow all TLDs
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    password: Joi.string()
        .min(6)
        .max(30)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password cannot exceed 30 characters',
            'any.required': 'Password is required'
        }),
    
    class: Joi.string()
        .min(1)
        .max(20)
        .trim()
        .required()
        .messages({
            'string.empty': 'Class is required',
            'string.min': 'Class must be at least 1 character',
            'string.max': 'Class cannot exceed 20 characters',
            'any.required': 'Class is required'
        }),
    
    college: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .messages({
            'string.empty': 'College/School name is required',
            'string.min': 'College/School name must be at least 2 characters',
            'string.max': 'College/School name cannot exceed 100 characters',
            'any.required': 'College/School name is required'
        })
});

// Student Login
const studentLoginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
});

// ============= TUTOR VALIDATION SCHEMAS =============

// Tutor Registration
const tutorRegisterSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 50 characters',
            'any.required': 'Name is required'
        }),
        phoneNumber: Joi.string()
  .pattern(/^\+[1-9]\d{7,14}$/)
  .required()
  .messages({
      "string.pattern.base": "Phone number must be in E.164 format e.g., +919876543210",
      "any.required": "Phone number is required"
  }),
    
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    password: Joi.string()
        .min(6)
        .max(30)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 6 characters',
            'string.max': 'Password cannot exceed 30 characters',
            'any.required': 'Password is required'
        }),
    
    subject: Joi.string()
        .valid('Maths', 'Computer Science', 'DSA', 'Development', 'MERN', 'Spring Boot')
        .required()
        .messages({
            'string.empty': 'Subject is required',
            'any.only': 'Subject must be one of: Maths, Computer Science, DSA, Development, MERN, Spring Boot',
            'any.required': 'Subject is required'
        }),
    
    college: Joi.string()
        .min(2)
        .max(100)
        .trim()
        .required()
        .messages({
            'string.empty': 'College/University name is required',
            'string.min': 'College/University name must be at least 2 characters',
            'string.max': 'College/University name cannot exceed 100 characters',
            'any.required': 'College/University name is required'
        })
});

// Tutor Login
const tutorLoginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .trim()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required',
            'any.required': 'Password is required'
        })
});

// ============= GOOGLE LOGIN VALIDATION =============

const googleLoginSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'string.empty': 'Google token is required',
            'any.required': 'Google token is required'
        }),
    
    role: Joi.string()
        .valid('student', 'tutor')
        .required()
        .messages({
            'string.empty': 'Role is required',
            'any.only': 'Role must be either student or tutor',
            'any.required': 'Role is required'
        })
});

// ============= EXPORTS =============

module.exports = {
    studentRegisterSchema,
    studentLoginSchema,
    tutorRegisterSchema,
    tutorLoginSchema,
    googleLoginSchema
};

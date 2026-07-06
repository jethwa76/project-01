import { body } from "express-validator";

export const projectRules = [
  body("title").trim().isLength({ min: 2 }).withMessage("Title is required."),
  body("summary").trim().isLength({ min: 10 }).withMessage("Summary must be meaningful."),
  body("description").trim().isLength({ min: 20 }).withMessage("Description must be meaningful.")
];

export const blogRules = [
  body("title").trim().isLength({ min: 2 }).withMessage("Title is required."),
  body("excerpt").trim().isLength({ min: 10 }).withMessage("Excerpt is required."),
  body("body").trim().isLength({ min: 20 }).withMessage("Blog body is required.")
];

export const messageRules = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
  body("subject").trim().isLength({ min: 3 }).withMessage("Subject is required."),
  body("message").trim().isLength({ min: 10 }).withMessage("Message is too short.")
];

export const skillRules = [
  body("name").trim().notEmpty().withMessage("Skill name is required."),
  body("category").trim().notEmpty().withMessage("Skill category is required."),
  body("level").optional().isInt({ min: 0, max: 100 }).withMessage("Level must be 0-100.")
];

export const certificateRules = [
  body("title").trim().notEmpty().withMessage("Certificate title is required."),
  body("issuer").trim().notEmpty().withMessage("Certificate issuer is required.")
];

export const testimonialRules = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("quote").trim().isLength({ min: 10 }).withMessage("Quote is required."),
  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5.")
];

export const notificationRules = [
  body("user").isMongoId().withMessage("Valid user id is required."),
  body("title").trim().notEmpty().withMessage("Title is required."),
  body("body").trim().notEmpty().withMessage("Body is required.")
];

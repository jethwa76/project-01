import Testimonial from "../models/Testimonial.js";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./crudController.js";

export const getTestimonials = getAll(Testimonial, ["name", "role", "company", "quote"]);
export const getTestimonial = getOne(Testimonial);
export const createTestimonial = createOne(Testimonial);
export const updateTestimonial = updateOne(Testimonial, ["name", "role", "company", "quote", "rating", "avatar", "visible", "approved", "position"]);
export const deleteTestimonial = deleteOne(Testimonial);

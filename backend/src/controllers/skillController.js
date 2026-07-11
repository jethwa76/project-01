import Skill from "../models/Skill.js";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./crudController.js";

export const getSkills = getAll(Skill, ["name", "category"]);
export const getSkill = getOne(Skill);
export const createSkill = createOne(Skill);
export const updateSkill = updateOne(Skill, ["name", "category", "level", "icon", "color", "order", "visible", "yearsOfExperience", "certificateUrl"]);
export const deleteSkill = deleteOne(Skill);

import Message from "../models/Message.js";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./crudController.js";

export const getMessages = getAll(Message, ["name", "email", "subject", "message"]);
export const getMessage = getOne(Message);
export const createMessage = createOne(Message);
export const updateMessage = updateOne(Message, ["status", "assignedTo"]);
export const deleteMessage = deleteOne(Message);

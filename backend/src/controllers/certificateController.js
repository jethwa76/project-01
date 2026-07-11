import Certificate from "../models/Certificate.js";
import { createOne, deleteOne, getAll, getOne, updateOne } from "./crudController.js";

export const getCertificates = getAll(Certificate, ["title", "issuer", "credentialId"]);
export const getCertificate = getOne(Certificate);
export const createCertificate = createOne(Certificate);
export const updateCertificate = updateOne(Certificate, ["title", "issuer", "credentialId", "credentialUrl", "issuedAt", "expiresAt", "image", "visible", "pdfUrl", "verificationLink", "organization", "skillsLearned"]);
export const deleteCertificate = deleteOne(Certificate);

import Setting from "../models/Setting.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await Setting.getInstance();
  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.getInstance();
  Object.assign(settings, req.body);
  await settings.save();
  res.json({ success: true, data: settings });
});

export const updateHero = asyncHandler(async (req, res) => {
  const settings = await Setting.getInstance();
  Object.assign(settings.hero, req.body);
  await settings.save();
  res.json({ success: true, data: settings.hero });
});

export const updateSocial = asyncHandler(async (req, res) => {
  const settings = await Setting.getInstance();
  Object.assign(settings.social, req.body);
  await settings.save();
  res.json({ success: true, data: settings.social });
});

export const updateContact = asyncHandler(async (req, res) => {
  const settings = await Setting.getInstance();
  Object.assign(settings.contact, req.body);
  await settings.save();
  res.json({ success: true, data: settings.contact });
});

export const updateResume = asyncHandler(async (req, res) => {
  const settings = await Setting.getInstance();
  settings.resume = { ...settings.resume, ...req.body, lastUpdated: new Date() };
  await settings.save();
  res.json({ success: true, data: settings.resume });
});

export const updateSeo = asyncHandler(async (req, res) => {
  const settings = await Setting.getInstance();
  Object.assign(settings.seo, req.body);
  await settings.save();
  res.json({ success: true, data: settings.seo });
});

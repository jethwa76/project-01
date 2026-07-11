import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { QueryFeatures } from "../utils/queryFeatures.js";
import { logActivity } from "../utils/activityLogger.js";

export const getAll = (Model, searchFields = [], populate = "") =>
  asyncHandler(async (req, res) => {
    const countQuery = new QueryFeatures(Model.find(), req.query).search(searchFields).filter();
    const total = await countQuery.query.clone().countDocuments();
    const features = new QueryFeatures(Model.find(), req.query)
      .search(searchFields)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    if (populate) features.query = features.query.populate(populate);

    const data = await features.query;
    res.json({ success: true, total, count: data.length, data });
  });

export const getOne = (Model, populate = "") =>
  asyncHandler(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populate) query = query.populate(populate);
    const doc = await query;
    if (!doc) return next(new ApiError(404, "Resource not found."));
    res.json({ success: true, data: doc });
  });

export const createOne = (Model) =>
  asyncHandler(async (req, res) => {
    if (req.user && Model.modelName === "Project") req.body.owner = req.user._id;
    if (req.user && Model.modelName === "Blog") req.body.author = req.user._id;
    const doc = await Model.create(req.body);

    if (req.user) {
      await logActivity(req, {
        userId: req.user._id,
        email: req.user.email,
        action: `${Model.modelName.toLowerCase()}_created`,
        status: "success",
        details: { id: doc._id, name: doc.title || doc.name }
      });
    }

    res.status(201).json({ success: true, data: doc });
  });

export const updateOne = (Model, allowedFields = []) =>
  asyncHandler(async (req, res, next) => {
    let updateData = req.body;
    if (allowedFields.length > 0) {
      updateData = Object.fromEntries(
        Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
      );
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });
    if (!doc) return next(new ApiError(404, "Resource not found."));

    if (req.user) {
      await logActivity(req, {
        userId: req.user._id,
        email: req.user.email,
        action: `${Model.modelName.toLowerCase()}_updated`,
        status: "success",
        details: { id: doc._id, name: doc.title || doc.name }
      });
    }

    res.json({ success: true, data: doc });
  });

export const deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new ApiError(404, "Resource not found."));

    if (req.user) {
      await logActivity(req, {
        userId: req.user._id,
        email: req.user.email,
        action: `${Model.modelName.toLowerCase()}_deleted`,
        status: "success",
        details: { id: req.params.id, name: doc.title || doc.name }
      });
    }

    res.status(204).end();
  });


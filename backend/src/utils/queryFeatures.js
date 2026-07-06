export class QueryFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  search(fields = []) {
    if (this.queryString.search && fields.length) {
      const escaped = this.queryString.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      this.query = this.query.find({ $or: fields.map((field) => ({ [field]: regex })) });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.queryString };
    ["page", "sort", "limit", "fields", "search"].forEach((field) => delete queryObj[field]);
    
    const sanitizeObj = (obj) => {
      if (typeof obj !== "object" || obj === null) return obj;
      const newObj = Array.isArray(obj) ? [] : {};
      for (const [key, value] of Object.entries(obj)) {
        if (key.startsWith("$")) continue;
        if (typeof value === "object" && value !== null) {
          newObj[key] = sanitizeObj(value);
        } else {
          newObj[key] = value;
        }
      }
      return newObj;
    };

    const sanitizedQuery = sanitizeObj(queryObj);
    this.query = this.query.find(sanitizedQuery);
    return this;
  }

  sort() {
    const sortBy = this.queryString.sort?.split(",").join(" ") || "-createdAt";
    this.query = this.query.sort(sortBy);
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields.split(",").join(" "));
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 12;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

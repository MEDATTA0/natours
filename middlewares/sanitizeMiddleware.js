import sanitize from "sanitize-html";
// Middleware to clean query data
const sanitizeMiddleware = (req, res, next) => {
  // Go through req.body (if POST/PUT) and clean each field
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitize(req.body[key], {
          allowedTags: [], // No HTML tags allowed
          allowedAttributes: {},
        });
      }
    }
  }

  // Loop through req.query (if GET) and clean each field
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitize(req.query[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
    }
  }

  // Go through req.params (if dynamic routes) and clean each field
  if (req.params) {
    for (let key in req.params) {
      if (typeof req.params[key] === "string") {
        req.params[key] = sanitize(req.params[key], {
          allowedTags: [],
          allowedAttributes: {},
        });
      }
    }
  }

  next(); // Continue to the next middleware
};

export default sanitizeMiddleware;

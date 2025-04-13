/**
 * Catches asynchronous errors in route handlers and passes them to the next error-handling middleware.
 * @param {Function} fn - The asynchronous function to wrap.
 * @returns {Function} - A middleware function that handles the asynchronous function.
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.log("🚀 ~ err:", err)
      next(err)
    });
  };
  
  
  export default catchAsync;
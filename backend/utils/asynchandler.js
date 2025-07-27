const asyncHandler = requestHandler => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (error) {
      console.error('Error occurred:', error);
      next(error); // delegate to global error handler
    }
  };
};

export default asyncHandler;

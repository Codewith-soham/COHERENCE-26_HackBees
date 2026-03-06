const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  console.error('❌ ERROR:', err.message);  // ADD THIS LINE
  console.error('❌ STACK:', err.stack);    // ADD THIS LINE
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};

export { errorHandler };
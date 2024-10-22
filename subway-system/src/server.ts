import app from './index';

const PORT = process.env.PORT || 3000;

// Start the server in this separate file
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


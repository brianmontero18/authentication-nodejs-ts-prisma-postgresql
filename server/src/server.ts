import app from "./app";
// Puerto
const PORT = process.env.PORT || 3000;

// Inicio del servidor
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

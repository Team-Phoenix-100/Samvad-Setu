const authRoutes = require("./routes/authRoutes");
const problemRoutes = require("./routes/problemRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { app } = require("./app");

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;

const app = require("./app");

const PORT = process.env.PORT || 5000;

async function startServer() {
    app.listen(PORT, () => {
        console.log(`Server running on ${PORT}`);
    });
}

startServer();
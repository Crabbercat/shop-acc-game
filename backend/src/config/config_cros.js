const cors = require("cors");

const config_cros = (app) => {
  // In development, allow the dev frontend to reach the API from network IPs.
  if (process.env.NODE_ENV !== 'production') {
    app.use(
      cors({
        origin: true, // reflect request origin
        credentials: true,
        exposedHeaders: ["set-cookie"],
      })
    );
    return;
  }

  // In production, restrict to configured CLIENT_URL only
  app.use(
    cors({
      origin: [
        `http://${process.env.CLIENT_URL}`,
        `https://${process.env.CLIENT_URL}`,
      ],
      credentials: true,
      exposedHeaders: ["set-cookie"],
    })
  );
};

module.exports = config_cros;

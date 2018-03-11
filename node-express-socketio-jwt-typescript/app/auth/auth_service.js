const jwt = require('express-jwt');
const jwks = require('jwks-rsa');
const config = require("config");
const jwksUri = config.get("AUTH0.URI");
const issuer = config.get("AUTH0.ISSUER");
const audience = config.get("AUTH0.AUDIENCE");

const authService = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri
  }),
//   audience, // @TODO check audience
  issuer,
  algorithms: ["RS256"]
});

module.exports = authService;

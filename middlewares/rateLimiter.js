const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).render('errorLimit', {
      title: 'Demasiados intentos',
      usuario: req.session.usuario || null,
    });
  },
});

module.exports = limiter;

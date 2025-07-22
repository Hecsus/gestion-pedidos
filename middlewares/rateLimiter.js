const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429)
    res.render('error', {
      title: 'Demasiados intentos',
      message: 'Has superado el límite de intentos. Intenta más tarde.',
      error: { status: 429 },
      usuario: req.session?.usuario || null,
    })
  },
})

module.exports = { authLimiter }

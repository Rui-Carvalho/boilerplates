const {Router} = require('express');
const router = Router();

router.post('/test', (req, res, next) => {
    res.json({});
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { applyForRoute, getMyApplications, getAllApplications, updateApplicationStatus } = require('../controllers/routeApplicationController');
const AuthProtect = require('../middlewares/AuthProtect');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/apply', AuthProtect, roleMiddleware('student'), applyForRoute);
router.get('/my-applications', AuthProtect, roleMiddleware('student'), getMyApplications);
router.get('/all', AuthProtect, roleMiddleware('admin'), getAllApplications);
router.put('/:id/status', AuthProtect, roleMiddleware('admin'), updateApplicationStatus);

module.exports = router;

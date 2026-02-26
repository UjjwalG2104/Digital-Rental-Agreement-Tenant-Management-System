import express from "express";
import { authRequired, requireRoles } from "../middleware/authMiddleware.js";
import {
  analyticsOverview,
  approveAgreement,
  listUsers,
  pendingAgreements,
  rejectAgreement,
  toggleUserStatus,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authRequired, requireRoles("admin"));

router.get("/users", listUsers);
router.patch("/users/:id/toggle", toggleUserStatus);

router.get("/agreements/pending", pendingAgreements);
router.post("/agreements/:id/approve", approveAgreement);
router.post("/agreements/:id/reject", rejectAgreement);

router.get("/analytics/overview", analyticsOverview);

export default router;


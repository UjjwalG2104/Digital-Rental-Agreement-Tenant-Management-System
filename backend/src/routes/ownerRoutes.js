import express from "express";
import { authRequired, requireRoles } from "../middleware/authMiddleware.js";
import {
  createAgreement,
  createProperty,
  deleteProperty,
  listOwnerAgreements,
  listOwnerProperties,
  ownerRentSummary,
} from "../controllers/ownerController.js";

const router = express.Router();

router.use(authRequired, requireRoles("owner"));

router.post("/properties", createProperty);
router.get("/properties", listOwnerProperties);
router.delete("/properties/:id", deleteProperty);

router.post("/agreements", createAgreement);
router.get("/agreements", listOwnerAgreements);

router.get("/rent/summary", ownerRentSummary);

export default router;


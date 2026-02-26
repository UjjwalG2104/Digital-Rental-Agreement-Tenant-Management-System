import Property from "../models/Property.js";
import Agreement from "../models/Agreement.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { generateAgreementPdf } from "../services/agreementPdfService.js";

export const createProperty = async (req, res) => {
  try {
    const { title, address, city, state, pincode, monthlyRent, securityDeposit } = req.body;

    const property = await Property.create({
      owner: req.user.id,
      title,
      address,
      city,
      state,
      pincode,
      monthlyRent,
      securityDeposit,
    });

    res.status(201).json({ property });
  } catch (err) {
    console.error("Create property error", err);
    res.status(500).json({ message: "Failed to create property" });
  }
};

export const listOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id, isActive: true }).sort("-createdAt");
    res.json({ properties });
  } catch (err) {
    console.error("List properties error", err);
    res.status(500).json({ message: "Failed to load properties" });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findOne({ _id: id, owner: req.user.id, isActive: true });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.isActive = false;
    await property.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Delete property error", err);
    res.status(500).json({ message: "Failed to delete property" });
  }
};

export const createAgreement = async (req, res) => {
  try {
    const { propertyId, tenantEmail, startDate, endDate, monthlyRent, securityDeposit } = req.body;

    const property = await Property.findOne({ _id: propertyId, owner: req.user.id });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const tenant = await User.findOne({ email: tenantEmail, role: "tenant" });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant user not found" });
    }

    const agreement = await Agreement.create({
      property: property._id,
      owner: req.user.id,
      tenant: tenant._id,
      startDate,
      endDate,
      monthlyRent,
      securityDeposit,
    });

    const pdfPath = await generateAgreementPdf({
      agreement,
      owner: await User.findById(req.user.id),
      tenant,
      property,
    });

    agreement.pdfPath = pdfPath;
    await agreement.save();

    await Notification.create({
      user: tenant._id,
      type: "system",
      message: "A new rental agreement has been created for you and is pending admin approval.",
    });

    res.status(201).json({ agreement });
  } catch (err) {
    console.error("Create agreement error", err);
    res.status(500).json({ message: "Failed to create agreement" });
  }
};

export const listOwnerAgreements = async (req, res) => {
  try {
    const agreements = await Agreement.find({ owner: req.user.id })
      .populate("tenant", "name email")
      .populate("property", "title address city state pincode")
      .sort("-createdAt");

    res.json({ agreements });
  } catch (err) {
    console.error("List agreements error", err);
    res.status(500).json({ message: "Failed to load agreements" });
  }
};

export const ownerRentSummary = async (req, res) => {
  try {
    const agreements = await Agreement.find({ owner: req.user.id, status: "active" }).select("_id");
    const agreementIds = agreements.map((a) => a._id);

    const payments = await Payment.find({ agreement: { $in: agreementIds } });

    const totalExpected = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalReceived = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount + p.lateFee, 0);
    const totalPending = totalExpected - totalReceived;

    res.json({
      totalExpected,
      totalReceived,
      totalPending,
    });
  } catch (err) {
    console.error("Owner rent summary error", err);
    res.status(500).json({ message: "Failed to load rent summary" });
  }
};


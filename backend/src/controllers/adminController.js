import User from "../models/User.js";
import Agreement from "../models/Agreement.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";

export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort("-createdAt");
    res.json({ users });
  } catch (err) {
    console.error("List users error", err);
    res.status(500).json({ message: "Failed to load users" });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user: { id: user._id, isActive: user.isActive } });
  } catch (err) {
    console.error("Toggle user status error", err);
    res.status(500).json({ message: "Failed to update user status" });
  }
};

export const pendingAgreements = async (req, res) => {
  try {
    const agreements = await Agreement.find({ status: "pending_approval" })
      .populate("owner", "name email")
      .populate("tenant", "name email")
      .populate("property", "title")
      .sort("-createdAt");

    res.json({ agreements });
  } catch (err) {
    console.error("Pending agreements error", err);
    res.status(500).json({ message: "Failed to load pending agreements" });
  }
};

export const approveAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    const agreement = await Agreement.findById(id);
    if (!agreement || agreement.status !== "pending_approval") {
      return res.status(404).json({ message: "Agreement not found or already processed" });
    }
    agreement.status = "active";
    await agreement.save();

    const monthlyAmount = agreement.monthlyRent;
    const dueDate = new Date(agreement.startDate);
    const payment = await Payment.create({
      agreement: agreement._id,
      amount: monthlyAmount,
      dueDate,
    });

    await Notification.create({
      user: agreement.tenant,
      type: "system",
      message: "Your rental agreement has been approved and activated.",
    });

    res.json({ agreement, firstPayment: payment });
  } catch (err) {
    console.error("Approve agreement error", err);
    res.status(500).json({ message: "Failed to approve agreement" });
  }
};

export const rejectAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    const agreement = await Agreement.findById(id);
    if (!agreement || agreement.status !== "pending_approval") {
      return res.status(404).json({ message: "Agreement not found or already processed" });
    }
    agreement.status = "rejected";
    await agreement.save();

    await Notification.create({
      user: agreement.tenant,
      type: "system",
      message: "Your rental agreement request has been rejected.",
    });

    res.json({ agreement });
  } catch (err) {
    console.error("Reject agreement error", err);
    res.status(500).json({ message: "Failed to reject agreement" });
  }
};

export const analyticsOverview = async (req, res) => {
  try {
    const activeAgreements = await Agreement.countDocuments({ status: "active" });
    const pendingAgreements = await Agreement.countDocuments({ status: "pending_approval" });

    const payments = await Payment.find();
    const totalIncome = payments
      .filter((p) => p.status === "paid" || p.status === "late")
      .reduce((sum, p) => sum + p.amount + p.lateFee, 0);

    res.json({
      activeAgreements,
      pendingAgreements,
      totalIncome,
    });
  } catch (err) {
    console.error("Analytics overview error", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};


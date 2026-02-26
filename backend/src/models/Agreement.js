import mongoose from "mongoose";

const agreementSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    monthlyRent: { type: Number, required: true },
    securityDeposit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending_approval", "active", "expired", "rejected"],
      default: "pending_approval",
    },
    pdfPath: { type: String }, // path where generated PDF is stored
  },
  { timestamps: true }
);

export default mongoose.model("Agreement", agreementSchema);


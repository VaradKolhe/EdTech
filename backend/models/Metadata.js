import mongoose from "mongoose";

const metadataSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      enum: ["onboarding-options"],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const Metadata = mongoose.model("Metadata", metadataSchema);
export default Metadata;

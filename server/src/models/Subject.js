import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Subject name must be at least 2 characters'],
      maxlength: [100, 'Subject name must be at most 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be at most 500 characters'],
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
subjectSchema.index({ isActive: 1 });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    targetType: {
      type: String,
      enum: ['Question', 'Answer'],
      required: true,
    },

    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },

    reason: {
      type: String,
      enum: [
        'spam',
        'offensive',
        'misleading',
        'plagiarism',
        'off-topic',
        'other',
      ],
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description must be at most 1000 characters'],
      default: '',
    },

    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    resolvedAt: {
      type: Date,
    },

    moderatorNote: {
      type: String,
      trim: true,
      maxlength: [500, ''],
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ target: 1, targetType: 1 });
reportSchema.index({ reporter: 1, target: 1, targetType: 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;

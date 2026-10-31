import mongoose from 'mongoose';

/**
 * Vote model.
 * Enforces one vote per (user, targetType, target) combination via a
 * compound unique index. The value is -1 (downvote) or 1 (upvote).
 * Self-voting is prevented in the controller layer.
 */
const voteSchema = new mongoose.Schema(
  {
    user: {
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

    value: {
      type: Number,
      enum: [-1, 1],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Unique constraint: one vote record per user-target pair.
// The controller uses findOneAndUpdate with upsert to safely handle
// vote changes and avoid race conditions.
voteSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });
voteSchema.index({ target: 1, targetType: 1 });

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;

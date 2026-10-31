import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    content: {
      type: String,
      required: [true, 'Answer content is required'],
      trim: true,
      minlength: [20, 'Answer must be at least 20 characters'],
      maxlength: [10000, 'Answer must be at most 10 000 characters'],
    },

    voteScore: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    verifiedAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ['visible', 'removed'],
      default: 'visible',
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
answerSchema.index({ question: 1, createdAt: 1 });
answerSchema.index({ question: 1, voteScore: -1 });
answerSchema.index({ author: 1, createdAt: -1 });

const Answer = mongoose.model('Answer', answerSchema);
export default Answer;

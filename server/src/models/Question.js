import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [300, 'Title must be at most 300 characters'],
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [10000, 'Description must be at most 10 000 characters'],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      index: true,
    },

    tags: {
      type: [String],
      validate: {
        validator: (tags) => tags.length <= 5,
        message: 'A question can have at most 5 tags',
      },
      default: [],
    },

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    answerCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    voteScore: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ['open', 'closed', 'removed'],
      default: 'open',
    },

    hasVerifiedAnswer: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
questionSchema.index({ createdAt: -1 });
questionSchema.index({ voteScore: -1 });
questionSchema.index({ status: 1, createdAt: -1 });
questionSchema.index({ tags: 1 });
// Text search index
questionSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { weights: { title: 3, tags: 2, description: 1 } },
);

const Question = mongoose.model('Question', questionSchema);
export default Question;

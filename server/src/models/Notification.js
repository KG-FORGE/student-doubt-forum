import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'new_answer',          // Someone answered your question
        'answer_verified',     // Your answer was verified
        'vote_received',       // Your content received a vote
        'account_suspended',   // Your account was suspended
        'account_reactivated', // Your account was reactivated
        'moderation',          // Your content was moderated
        'announcement',        // Platform announcement
      ],
      required: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: [500, ''],
    },

    /** The resource the notification links to (e.g. the question or answer). */
    relatedType: {
      type: String,
      enum: ['Question', 'Answer', 'User', null],
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;

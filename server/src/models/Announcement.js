import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must be at most 200 characters'],
    },

    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [5000, 'Content must be at most 5000 characters'],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

announcementSchema.index({ isPublished: 1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;

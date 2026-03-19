import mongoose from 'mongoose';

const adSchema = mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
    },
    city: { type: String, required: true },
    images: [{ type: String }],
    condition: {
      type: String,
      enum: ['new', 'used', 'refurbished'],
      default: 'used',
    },
    adType: {
      type: String,
      enum: ['simple', 'featured'],
      default: 'simple',
    },
    listingType: {
      type: String,
      enum: ['simple', 'featured', 'boosted'],
      default: 'simple',
    },
    isFeatured: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
      }
    },
    phone: { type: String },
    brand: { type: String },
    isNegotiable: { type: Boolean, default: false },
    slug: { type: String },
  },
  { timestamps: true }
);

// Text index for search
adSchema.index({ title: 'text', description: 'text' });

// Auto-generate slug from title
adSchema.pre('save', async function () {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60) + '-' + Date.now();
  }

  // Synch adType and listingType for backward compatibility
  if (this.isModified('adType')) {
    this.listingType = this.adType;
  } else if (this.isModified('listingType')) {
    this.adType = this.listingType === 'featured' ? 'featured' : 'simple';
  }

  // Expiry Logic
  if (this.isNew || this.isModified('adType') || this.isModified('listingType')) {
    if (this.adType === 'featured') {
      this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      this.isFeatured = true;
    } else {
      // If it's simple, give it 30 days if not already set or if just converted from featured
      if (this.isNew || this.isModified('adType')) {
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        this.isFeatured = false;
      }
    }
  }

  // Automatic conversion of expired featured ads to simple ads
  if (this.adType === 'featured' && this.expiresAt < new Date()) {
    this.adType = 'simple';
    this.listingType = 'simple';
    this.isFeatured = false;
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }
});

const Ad = mongoose.model('Ad', adSchema);

adSchema.index({ adType: 1, isActive: 1 });
adSchema.index({ listingType: 1, isActive: 1 });
adSchema.index({ isActive: 1, expiresAt: 1 });

export default Ad;

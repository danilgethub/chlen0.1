import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  discriminator: {
    type: String
  },
  avatar: {
    type: String
  },
  email: {
    type: String
  },
  coins: {
    type: Number,
    default: 0
  },
  lastLoginDate: {
    type: Date,
    default: Date.now
  },
  isSubscribed: {
    type: Boolean,
    default: true
  },
  notificationSettings: {
    serverEvents: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    directMessages: {
      type: Boolean,
      default: true
    }
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Метод для добавления монет пользователю
userSchema.methods.addCoins = function(amount) {
  this.coins += amount;
  return this.save();
};

// Метод для изменения настроек уведомлений
userSchema.methods.updateNotificationSettings = function(settings) {
  this.notificationSettings = {
    ...this.notificationSettings,
    ...settings
  };
  return this.save();
};

export default mongoose.model('User', userSchema); 
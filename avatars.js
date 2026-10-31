// ৫০+ ডায়নামিক কোডেড SVG এভাটার জেনারেটর (ছেলে ও মেয়ে ক্যাটাগরি)
const Avatars = { male: [], female: [] };

(function initializeAvatars() {
  for (let i = 1; i <= 30; i++) {
    Avatars.male.push(`https://api.dicebear.com/7.x/bottts/svg?seed=male_avatar_${i}`);
    Avatars.female.push(`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=female_avatar_${i}`);
  }
})();

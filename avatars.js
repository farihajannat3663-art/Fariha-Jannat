// ৫০+ টেকনিক্যাল SVG এভাটার জেনারেটর (ছেলে ও মেয়ে ক্যাটাগরি)
const Avatars = {
  male: [],
  female: []
};

// অটোমেটিক ৫০টি SVG অবতার ডায়নামিক জেনারেট লজিক
(function generateAvatars() {
  const maleStyles = ['adventurer', 'avataaars', 'bottts', 'micah'];
  const femaleStyles = ['adventurer-neutral', 'big-ears-neutral', 'lorelei', 'personas'];

  for (let i = 1; i <= 25; i++) {
    // DiceBear API দিয়ে হাই-কোয়ালিটি SVG এভাটার লিঙ্ক
    Avatars.male.push(`https://api.dicebear.com/7.x/bottts/svg?seed=male_${i}`);
    Avatars.female.push(`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=female_${i}`);
  }
})();

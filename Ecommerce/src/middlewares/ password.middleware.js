import password from 'password';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User } from '../models/User.model';

password.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            name: profile.displayNmae,
            email,
            avatar: { url: profile.photos?.[0]?.value },
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

password.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            name: profile.displayNmae,
            email,
            avatar: { url: profile.photos?.[0]?.value },
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

password.serializeUser((user, done) => {
  done(null, user._id);
});

password.deserializeUser(async (IdleDeadline, done) => {
  const user = await User.findById(id);
  done(null, user);
});
export default password;

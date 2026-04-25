# Kitten Adoption & Sales Website

A complete full-stack kitten/cat adoption and sales platform using:
- Frontend: HTML/CSS/JavaScript
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Uploads: Multer
- Admin auth: Session-based login/logout

## Features
- Public pages: Home, Available Kittens, Kitten Profile, About, Adoption Process, Testimonials, FAQ, Contact
- Admin pages: Login, Dashboard, Kittens CRUD, Inquiries, Reservations, Testimonials Manager, CMS Manager, Settings
- Shared authentication:
  - One login page for both `admin` and `user`
  - Public register page for normal users only
  - Role-based redirects and protected routes
- MongoDB models: `Kitten`, `Inquiry`, `Reservation`, `Testimonial`, `PageContent`, `SiteSettings`, `AdminUser`
- Input validation with `express-validator`
- Password hashing with `bcrypt`
- Rate limiting for login/contact routes
- Rate limiting for register route
- Responsive design and professional soft-luxury UI

## Project Structure

```text
public/
  admin/
  assets/css/
  assets/js/
  uploads/
src/
  config/
  middleware/
  models/
  routes/api/
  routes/
  seed/
  app.js
  server.js
.env.example
package.json
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```
(Or create manually on Windows.)

3. Fill `.env` values:
- `MONGODB_URI` = your MongoDB connection string
- `SESSION_SECRET` = long random secret
- `JWT_SECRET` = long random JWT secret
- `EMAIL_USER` = Gmail address used for OTP delivery
- `EMAIL_PASS` = Gmail App Password (not your normal Gmail password)
- `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`

4. Seed first admin user:
```bash
npm run seed:admin
```

5. Register a normal user:
- Open `http://localhost:5000/register`
- Admin accounts cannot be created from public registration.

6. Start development server:
```bash
npm run dev
```

7. Open:
- Public site: `http://localhost:5000`
- Shared login: `http://localhost:5000/login`
- Admin dashboard (after admin login): `http://localhost:5000/admin/dashboard`

## OTP Authentication Flow
- Register:
  - Submit register form.
  - OTP is sent to your email.
  - Enter OTP on `/otp` to verify account.
- Login:
  - Submit login form.
  - OTP is sent to your email.
  - Enter OTP on `/otp` to complete login and receive auth token/session.

## Security Notes
- Never expose `MONGODB_URI` in frontend code.
- Change the default seed password in `.env` before production use.
- Use HTTPS + secure cookies in production (`cookie.secure = true`).
- Consider adding CSRF protection for production.

## Admin Credentials
Use the values in `.env` for `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` after running seed.

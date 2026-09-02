'use client';

import type { FormEvent } from 'react';

const SECRETARY_EMAIL = 'secretary.stmochtas.louth@gaa.ie';

const sponsorshipOptions = [
  'Ground sponsorship',
  'Pitch-side hoardings',
  'Player of the match award',
  'Adult team sponsor',
  'Youth team sponsor (multiple teams)',
  'Teamwear provider',
  'Kit bag sponsor',
  'Scoreboard sponsor',
  'Website main sponsor',
  'Website match centre sponsor',
  'Player of the season awards',
  'Summer Camp',
  'Match ball sponsor',
];

export default function SponsorshipEnquiryForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const business = String(form.get('business') || '');
    const website = String(form.get('website') || 'Not supplied');
    const opportunity = String(form.get('opportunity') || 'General sponsorship enquiry');
    const contact = String(form.get('contact') || '');
    const email = String(form.get('email') || '');
    const phone = String(form.get('phone') || 'Not supplied');
    const message = String(form.get('message') || 'No additional message.');

    const subject = `St. Mochtas sponsorship enquiry — ${business}`;
    const body = [
      'Sponsorship enquiry from the St. Mochtas GFC website',
      '',
      `Business: ${business}`,
      `Business website: ${website}`,
      `Sponsorship opportunity: ${opportunity}`,
      `Contact name: ${contact}`,
      `Contact email: ${email}`,
      `Contact phone: ${phone}`,
      '',
      'Message:',
      message,
    ].join('\n');

    window.location.href = `mailto:${SECRETARY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="sponsorship-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="business">Business name <span>*</span></label>
        <input id="business" name="business" type="text" autoComplete="organization" required />
      </div>

      <div className="form-field">
        <label htmlFor="website">Business website</label>
        <input id="website" name="website" type="url" inputMode="url" placeholder="https://" />
      </div>

      <div className="form-field form-field-wide">
        <label htmlFor="opportunity">Sponsorship opportunity <span>*</span></label>
        <select id="opportunity" name="opportunity" defaultValue="" required>
          <option value="" disabled>Select an opportunity</option>
          {sponsorshipOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="contact">Contact name <span>*</span></label>
        <input id="contact" name="contact" type="text" autoComplete="name" required />
      </div>

      <div className="form-field">
        <label htmlFor="email">Contact email <span>*</span></label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="form-field">
        <label htmlFor="phone">Contact phone</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" />
      </div>

      <div className="form-field form-field-wide">
        <label htmlFor="message">Tell us a little more</label>
        <textarea id="message" name="message" rows={5} />
      </div>

      <div className="form-submit form-field-wide">
        <button className="button button-yellow" type="submit">Send enquiry <span>→</span></button>
        <p>This opens an email addressed to the club secretary, ready for you to review and send.</p>
      </div>
    </form>
  );
}

import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/shared/hooks/use-page-title';

const FIELD_CLASSES =
  'rounded-md border border-border bg-surface px-3 py-2 text-fg disabled:opacity-60';

// Placeholder: the form is not wired yet, so its fields stay disabled.
// TODO(AVG-23): zod + react-hook-form, POST /auth/login, then the safe ?redirect= destination.
export default function Login() {
  const { t } = useTranslation('auth');

  usePageTitle(t('login.title'));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <section className="flex flex-1 items-center justify-center p-6">
      <form
        aria-labelledby="login-title"
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-md border border-border bg-surface-raised p-6"
      >
        <h1 id="login-title" className="text-2xl">
          {t('login.title')}
        </h1>
        <p className="text-sm text-fg-muted">{t('login.unavailable')}</p>
        <fieldset disabled className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            {t('login.email')}
            <input type="email" name="email" autoComplete="email" className={FIELD_CLASSES} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            {t('login.password')}
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              className={FIELD_CLASSES}
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2 font-medium text-accent-fg disabled:opacity-60"
          >
            {t('login.submit')}
          </button>
        </fieldset>
      </form>
    </section>
  );
}

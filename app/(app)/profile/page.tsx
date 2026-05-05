import { requireUser } from "@/lib/auth";
import ProfileForm from "@/components/ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-container-max px-6 md:px-margin-desktop">
      <header className="mb-12">
        <h1 className="font-display text-h1 text-on-surface">
          Your <span className="text-primary">profile</span>
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl mt-2">
          Update your name, choose a username, or set a password for quicker logins.
        </p>
      </header>

      <ProfileForm
        initialName={user.name ?? ""}
        initialUsername={user.username ?? ""}
        phone={user.phone}
      />
    </main>
  );
}

import { revalidatePath } from "next/cache";

const LOCALES = ["en", "es", "fr"] as const;

function revalidateLocalized(pathSuffix: string) {
  for (const locale of LOCALES) {
    revalidatePath(`/${locale}${pathSuffix}`);
  }
}

/** Call after submission status or payment changes */
export function revalidateSubmissionViews() {
  revalidateLocalized("/portal/submissions");
  revalidateLocalized("/portal");
  revalidateLocalized("/curator");
  revalidateLocalized("/curator/master");
  revalidateLocalized("/admin/submissions");
  revalidateLocalized("/admin");
  revalidateLocalized("/industry/submissions");
}

/** Call after curator review actions */
export function revalidateCuratorViews() {
  revalidateLocalized("/curator");
  revalidateLocalized("/curator/master");
  revalidateLocalized("/admin/submissions");
}

/** Call after master curator decisions */
export function revalidateMasterViews() {
  revalidateLocalized("/curator/master");
  revalidateLocalized("/portal/submissions");
  revalidateLocalized("/admin/submissions");
}

import { redirect } from "next/navigation";

/** Previous URL — forwards bookmarks and external links to Image Enlarger. */
export default function LegacyImageEnlargerUrlRedirectPage() {
  redirect("/tools/image-enlarger");
}

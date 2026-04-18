import { redirect } from "next/navigation";

/**
 * Old URL — audio transcription is not part of the public launch.
 * Redirect keeps bookmarks and external links from 404ing.
 */
export default function AudioToTextRedirectPage() {
  redirect("/tools");
}

import type { Alpine } from "alpinejs";
import { registerMeetingAppStore } from "./store/app";

export default function initAlpine(Alpine: Alpine) {
  registerMeetingAppStore(Alpine);
}

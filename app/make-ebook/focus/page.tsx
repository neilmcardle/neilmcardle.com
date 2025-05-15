import type { Metadata } from "next"
import FocusModePage from "./FocusModePage"

export const metadata: Metadata = {
  title: "makeEbook Focus Mode",
  description: "A distraction-free writing environment for creating your eBook",
}

export default function Page() {
  return <FocusModePage />
}

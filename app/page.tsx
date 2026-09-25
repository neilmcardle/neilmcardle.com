import { GeistSans } from "geist/font/sans";
import Home from "./_home/Home";

export default function Homepage() {
  return (
    <div className={GeistSans.variable}>
      <style>
        {"html,body{background:#ebe8e4}html{scrollbar-color:#c9c3bc #ebe8e4}"}
      </style>
      <Home />
    </div>
  );
}

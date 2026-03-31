import { useEffect } from "react";

declare global {
  interface Window {
    kofiwidget2?: {
      init: (text: string, color: string, id: string) => void;
      draw: () => void;
    };
  }
}

export default function KofiButton() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://storage.ko-fi.com/cdn/widget/Widget_2.js";
    script.async = true;
    script.onload = () => {
      window.kofiwidget2?.init("Support me on Ko-fi", "#5570c4", "R6R31BD6FQ");
      window.kofiwidget2?.draw();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div className="kofi-wrapper" />;
}

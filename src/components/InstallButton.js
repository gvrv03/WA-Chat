"use client";

import { useEffect, useState } from "react";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setSupported(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log("User choice:", outcome);

    setDeferredPrompt(null);
    setSupported(false);
  };

  if (!supported) return null;

  return (
    <button
      onClick={installApp}
      className="px-4 py-2 text-white rounded-lg"
    >
      Download App
    </button>
  );
}

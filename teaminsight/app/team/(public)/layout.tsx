import React from "react";
import BackButton from "../_components/BackButton";

export default function TeamPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-end">
        <BackButton />
      </div>

      {children}
    </div>
  );
}

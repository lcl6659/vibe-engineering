"use client";

import React from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import AuthPanel from "@/components/AuthPanel";

export default function AuthPage() {
  return (
    <DashboardLayout
      title="Security Center"
      description="Manage your API credentials and access levels."
    >
      <AuthPanel />
    </DashboardLayout>
  );
}

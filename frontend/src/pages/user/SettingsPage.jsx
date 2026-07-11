import { useState } from "react";
import { FaLock, FaShieldAlt, FaLaptop } from "react-icons/fa";
import ChangePasswordPage from "../auth/ChangePasswordPage";
import TwoFactorSetup from "../auth/TwoFactorSetup";
import SessionsPage from "./SessionsPage";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("security");

  const tabs = [
    { id: "security", label: "Security & Password", icon: FaLock },
    { id: "2fa", label: "Two-Factor Auth", icon: FaShieldAlt },
    { id: "sessions", label: "Active Sessions", icon: FaLaptop }
  ];

  return (
    <section className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Account Settings</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
        Manage password, set up two-factor authentication, and monitor active sessions.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Tabs */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 scrollbar-none border-b md:border-b-0 border-slate-100 dark:border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-950"
                  }`}
                >
                  <Icon className="text-base" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab Panel Content */}
        <main className="flex-grow">
          {activeTab === "security" && <ChangePasswordPage />}
          {activeTab === "2fa" && <TwoFactorSetup />}
          {activeTab === "sessions" && <SessionsPage />}
        </main>
      </div>
    </section>
  );
}

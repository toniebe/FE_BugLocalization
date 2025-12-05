// src/components/Onboarding.jsx (atau sesuai path kamu)
"use client";
import React from "react";

export const ONBOARDING_STEPS = [
  {
    id: 1,
    label: "Add Project",
    description: "Add your project name to get started with EasyFix.",
  },
  {
    id: 2,
    label: "Upload Bug Data",
    description: "Upload your bug JSON file to prepare data source.",
  },
  {
    id: 3,
    label: "Check Bug Data Env",
    description: "Verify ML environment & data source configuration.",
  },
  {
    id: 4,
    label: "Start Using EasyFix",
    description: "Run ML engine and begin using bug resolution.",
  },
];

export default function OnboardingLayout({ currentStep, children }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl bg-white rounded-xl shadow-md flex flex-col md:flex-row overflow-hidden">
          {/* Left sidebar */}
          <aside className="w-full md:w-1/3 bg-gradient-to-b from-[#01559A] to-[#001D34] text-white p-8 flex flex-col">
            <h2 className="text-2xl font-semibold mb-6">
              Get started by setting up your project!
            </h2>

            {/* TIMELINE */}
            <div className="relative pl-10">
              <div className="absolute left-15 top-3 bottom-3 border-l-2 border-white/40" />

              {ONBOARDING_STEPS.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                  <div
                    key={step.id}
                    className="relative flex items-start mb-10"
                  >
                    <div
                      className={
                        "relative z-10 w-12 h-12 rounded-full border-white bg-white flex items-center justify-center text-sm font-bold border-2 "
                        
                        
                      }
                    >
                      {/* kalau punya icon onboarding-1.png dst, tetap dipakai */}
                      <img
                        className="w-6 h-6"
                        src={`/onboarding-${step.id}.png`}
                        alt={step.label}
                      />
                    </div>

                    <div className="ml-3 mt-1">
                      <div
                        className={
                          "font-semibold" +
                          (isActive
                            ? " text-white"
                            : isCompleted
                            ? " text-emerald-100"
                            : " text-blue-100")
                        }
                      >
                        {step.label}
                      </div>
                      <p className="text-xs text-blue-100 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Right content (step body) */}
          <section className="w-full md:w-2/3 p-8">{children}</section>
        </div>
      </main>
    </div>
  );
}

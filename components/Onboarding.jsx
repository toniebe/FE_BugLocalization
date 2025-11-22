"use client";
import React from "react";

export const ONBOARDING_STEPS = [
  {
    id: 1,
    label: "Add Project",
    description: "Add your project name for started using easyfix",
  },
  {
    id: 2,
    label: "Setup Bug Data",
    description: "Upload your bug data json for support bug resolution",
  },
  {
    id: 3,
    label: "Start Using Easyfix",
    description: "Start fixing bug with bug resolution easy fix",
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
              Get Started by setup your project!
            </h2>

            {/* TIMELINE */}
            <div className="relative pl-10">
              <div className="absolute left-15 top-3 bottom-3 border-l-2 border-white/40" />

              {ONBOARDING_STEPS.map((step) => {
                const isActive = step.id === currentStep; 

                return (
                  <div key={step.id} className="relative flex items-start mb-10">
                    <div className="relative z-10 w-15 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white bg-white">
                      <img className="mx-auto my-auto w-6 h-6" src={`/onboarding-${step.id}.png`} />
                    </div>

                    <div className="ml-3 mt-1">
                      <div
                        className={
                          "font-semibold" + (isActive ? " text-white" : " text-blue-100")
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

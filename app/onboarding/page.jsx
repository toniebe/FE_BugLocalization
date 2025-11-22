"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout, { ONBOARDING_STEPS } from "@/components/Onboarding";
import LayoutCustom from "@/components/LayoutCustom";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1 state
  const [orgName, setOrgName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Step 2 state
  const [isCheckingData, setIsCheckingData] = useState(false);
  const [isBugDataReady, setIsBugDataReady] = useState(false);

  const totalSteps = ONBOARDING_STEPS.length;

  // STEP 1
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    if (!orgName.trim() || !projectName.trim()) return;

    try {
      setIsSavingProject(true);

      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSavingProject(false);
    }
  };

  // STEP 2
  const handleCheckData = async () => {
    try {
      setIsCheckingData(true);

      setTimeout(() => {
        setIsBugDataReady(true);
      }, 800);
    } catch (err) {
      console.error(err);
      alert("Failed to check data.");
    } finally {
      setIsCheckingData(false);
    }
  };

  const handleContinueFromStep2 = () => {
    if (!isBugDataReady) {
      alert("Bug data is not ready yet.");
      return;
    }

    setStep(3);
  };

  const handleGoToHomeFromStep3 = () => {
    router.push("/home");
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <>
          <p className="text-sm text-gray-500 mb-2">
            Step {step} of {totalSteps}
          </p>
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Create Your Project
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Set up your project by choosing a unique name. The project name will
            be used as the database name and will act as the main identifier
            when updating or inserting new data.
          </p>

          <form className="space-y-6" onSubmit={handleSubmitStep1}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Your organization"
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Please provide a Project Name to complete your project profile.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="ex: thunderbird-bug-resolution"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={
                  isSavingProject || !orgName.trim() || !projectName.trim()
                }
                className="px-6 py-2 rounded-md text-sm font-semibold bg-[#01559A] text-white disabled:opacity-60"
              >
                {isSavingProject ? "Saving..." : "Save and Continue"}
              </button>
            </div>
          </form>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <p className="text-sm text-gray-500 mb-2">
            Step {step} of {totalSteps}
          </p>
          <h1 className="text-2xl font-bold text-[#01559A] mb-2">
            Setup Bug Data
          </h1>
          <p className="text-sm text-gray-600 mb-8">
            Check your environments already setup from admin or not with click
            checking button below
          </p>

          <div className="flex items-center gap-6 mb-10">
            <button
              type="button"
              onClick={handleCheckData}
              disabled={isCheckingData}
              className="px-5 py-2 rounded-md border border-[#01559A] text-[#01559A] text-sm font-semibold hover:bg-blue-50 disabled:opacity-60"
            >
              {isCheckingData ? "Checking..." : "Check Data"}
            </button>

            <div className="text-xl font-bold text-[#01559A]">
              {isBugDataReady ? "Ready" : "Not Ready"}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleContinueFromStep2}
              disabled={!isBugDataReady}
              className="px-6 py-2 rounded-md text-sm font-semibold bg-[#01559A] text-white disabled:opacity-60"
            >
              Save and Continue
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <p className="text-sm text-gray-500 mb-2">
          Step {step} of {totalSteps}
        </p>
        <h1 className="text-2xl font-bold text-[#01559A] mb-2">
          Start Using Easyfix
        </h1>
        <p className="text-sm text-gray-600 mb-8 max-w-xl">
          Waiting 2 x 24 hours to waiting admin config your bug data setup
          properly. After that you can start bug resolution with Easyfix.
        </p>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGoToHomeFromStep3}
            className="px-6 py-2 rounded-md text-sm font-semibold bg-[#01559A] text-white"
          >
            Continue
          </button>
        </div>
      </>
    );
  };

  return (
    <LayoutCustom>
      <OnboardingLayout currentStep={step}>
        {renderStepContent()}
      </OnboardingLayout>
    </LayoutCustom>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout, { ONBOARDING_STEPS } from "@/components/Onboarding";
import LayoutCustom from "@/components/LayoutCustom";
import { checkMlEnv, createProject, getMlStatus, startMlEngine } from "../_lib/project";


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
  const [envResult, setEnvResult] = useState(null);
  const [envError, setEnvError] = useState("");

  // Step 3 state
  const [isStartingML, setIsStartingML] = useState(false);
  const [hasStartedML, setHasStartedML] = useState(false);
  const [isCheckingMlStatus, setIsCheckingMlStatus] = useState(false);
  const [mlStatus, setMlStatus] = useState(null);
  const [mlError, setMlError] = useState("");

  const totalSteps = ONBOARDING_STEPS.length;

  // =====================
  // STEP 1 – Create Project
  // =====================
  const handleSubmitStep1 = async (e) => {
    e.preventDefault();
    if (!orgName.trim() || !projectName.trim()) return;

    try {
      setIsSavingProject(true);

      const data = await createProject(orgName.trim(), projectName.trim());
      if (!data.ok) {
        throw new Error(data.error || "Failed to create project");
      }

      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to save project. Please try again.");
    } finally {
      setIsSavingProject(false);
    }
  };

  // =====================
  // STEP 2 – Check ML Environment
  // =====================
  const handleCheckData = async () => {
    if (!orgName.trim() || !projectName.trim()) {
      alert(
        "Organization and project name are missing. Please go back to step 1."
      );
      return;
    }

    try {
      setIsCheckingData(true);
      setEnvError("");
      setEnvResult(null);
      setIsBugDataReady(false);

      const data = await checkMlEnv(orgName.trim(), projectName.trim());
      const env = data.environment || {};
      setEnvResult(env);

      const allGood =
        env.ok && env.ml_engine_dir_ok && env.datasource_ok && env.neo4j_ok;

      setIsBugDataReady(!!allGood);
    } catch (err) {
      console.error(err);
      setEnvError(err.message || "Failed to check data.");
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

  // =====================
  // STEP 3 – Start ML Engine & Check Status
  // =====================

  const handleStartML = async () => {
    if (!orgName.trim() || !projectName.trim()) {
      alert(
        "Organization and project name are missing. Please go back to step 1."
      );
      return;
    }

    try {
      setIsStartingML(true);
      setMlError("");
      setMlStatus(null);

      const data = await startMlEngine(orgName.trim(), projectName.trim());
      // backend payload: { status: "ok", message, organization, project, ... }
      if (data.status !== "ok") {
        throw new Error(data.message || "Failed to start ML engine");
      }

      setHasStartedML(true);
    } catch (err) {
      console.error(err);
      setMlError(
        err.message ||
          "Failed to start ML engine. Please check your environment or contact admin."
      );
      setHasStartedML(false);
    } finally {
      setIsStartingML(false);
    }
  };

  const handleCheckMlStatus = async () => {
    if (!orgName.trim() || !projectName.trim()) {
      alert(
        "Organization and project name are missing. Please go back to step 1."
      );
      return;
    }

    try {
      setIsCheckingMlStatus(true);
      setMlError("");

      const data = await getMlStatus(orgName.trim(), projectName.trim());
      // payload: { status, organization, project, ml_status: {...} }
      if (data.status !== "ok") {
        throw new Error("Failed to get ML status");
      }

      setMlStatus(data.ml_status || null);
    } catch (err) {
      console.error(err);
      setMlError(err.message || "Failed to check ML status.");
    } finally {
      setIsCheckingMlStatus(false);
    }
  };

  const canGoHome =
    mlStatus &&
    mlStatus.import === "done" &&
    (mlStatus.stage === "COMPLETED" || mlStatus.stage === "completed");

  const handleGoToHomeFromStep3 = () => {
    if (!canGoHome) {
      alert(
        "Synchronization is not completed yet. Please wait until the import status is done."
      );
      return;
    }

    router.push("/home");
  };

  const renderStepContent = () => {
    // ===== STEP 1 UI =====
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

    // ===== STEP 2 UI =====
    if (step === 2) {
      const env = envResult || {};
      const envItems = [
        { key: "ok", label: "Overall Environment", value: env.ok },
        {
          key: "ml_engine_dir_ok",
          label: "ML Engine Directory",
          value: env.ml_engine_dir_ok,
        },
        {
          key: "datasource_ok",
          label: "Datasource File",
          value: env.datasource_ok,
        },
        {
          key: "neo4j_ok",
          label: "Neo4j Connection",
          value: env.neo4j_ok,
        },
      ];

      return (
        <>
          <p className="text-sm text-gray-500 mb-2">
            Step {step} of {totalSteps}
          </p>
          <h1 className="text-2xl font-bold text-[#01559A] mb-2">
            Setup Bug Data
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Check whether your environments are already configured by the admin
            before continuing to synchronization.
          </p>

          <div className="flex items-center gap-6 mb-4">
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

          {envError && (
            <p className="text-sm text-red-500 mb-3">{envError}</p>
          )}

          {/* Tabel status environment */}
          {envResult && (
            <div className="mb-6 border rounded-lg p-4 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Environment status
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {envItems.map((item) => (
                    <tr key={item.key} className="border-t last:border-b">
                      <td className="py-2 pr-3 text-gray-600">
                        {item.label}
                      </td>
                      <td className="py-2">
                        {item.value ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                            OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                            Not OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!isBugDataReady && (
                <p className="mt-4 text-xs text-red-600">
                  Please contact the admin to process the data and environment
                  so you can start synchronization in step 3.
                </p>
              )}
            </div>
          )}

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

    // ===== STEP 3 UI =====
    const ml = mlStatus || {};

    return (
      <>
        <p className="text-sm text-gray-500 mb-2">
          Step {step} of {totalSteps}
        </p>
        <h1 className="text-2xl font-bold text-[#01559A] mb-2">
          Start Using Easyfix
        </h1>
        <p className="text-sm text-gray-600 mb-4 max-w-xl">
          Start the ML engine to process and synchronize your bug data. After
          the pipeline is completed, you can start using Easyfix for bug
          resolution.
        </p>

        {mlError && (
          <p className="text-sm text-red-500 mb-3">{mlError}</p>
        )}

        <div className="flex items-center gap-4 mb-4">
          <button
            type="button"
            onClick={handleStartML}
            disabled={isStartingML}
            className="px-5 py-2 rounded-md border border-[#01559A] text-[#01559A] text-sm font-semibold hover:bg-blue-50 disabled:opacity-60"
          >
            {isStartingML ? "Starting..." : "Start ML Engine"}
          </button>

          <button
            type="button"
            onClick={handleCheckMlStatus}
            disabled={!hasStartedML || isCheckingMlStatus}
            className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
          >
            {isCheckingMlStatus ? "Checking status..." : "Check Status"}
          </button>
        </div>

        {/* Status ML */}
        {mlStatus && (
          <div className="mb-6 border rounded-lg p-4 bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              ML pipeline status
            </h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium">Stage:</span> {ml.stage}
              </p>
              <p>
                <span className="font-medium">Progress:</span>{" "}
                {ml.progress ?? 0}%
              </p>
              <p>
                <span className="font-medium">Import:</span> {ml.import}
              </p>
              <p>
                <span className="font-medium">Training:</span>{" "}
                {ml.training}
              </p>
              <p>
                <span className="font-medium">Message:</span>{" "}
                {ml.message}
              </p>
              <p className="text-xs text-gray-500">
                Updated at: {ml.updated_at}
              </p>
            </div>

            {!canGoHome && (
              <p className="mt-4 text-xs text-red-600">
                The ML pipeline is still in progress. Please wait until the
                import status is <strong>done</strong> before continuing.
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGoToHomeFromStep3}
            disabled={!canGoHome}
            className="px-6 py-2 rounded-md text-sm font-semibold bg-[#01559A] text-white disabled:opacity-60"
          >
            Continue to Home
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

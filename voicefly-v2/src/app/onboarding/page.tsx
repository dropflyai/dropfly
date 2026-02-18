"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Building2, Phone, Bot, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const industries = [
  { id: "medical", label: "Medical/Healthcare", icon: "🏥" },
  { id: "dental", label: "Dental", icon: "🦷" },
  { id: "beauty", label: "Beauty/Spa", icon: "💅" },
  { id: "automotive", label: "Automotive", icon: "🚗" },
  { id: "legal", label: "Legal", icon: "⚖️" },
  { id: "realestate", label: "Real Estate", icon: "🏠" },
  { id: "fitness", label: "Fitness", icon: "💪" },
  { id: "other", label: "Other", icon: "🏢" },
];

const steps = [
  { id: "business", title: "Business Info", icon: Building2 },
  { id: "contact", title: "Contact Details", icon: Phone },
  { id: "assistant", title: "AI Assistant", icon: Bot },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    phone: "",
    address: "",
    assistantName: "Maya",
    assistantGreeting: "Hello! Thank you for calling. How can I help you today?",
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent-purple)]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-[var(--color-text-primary)]">
              VoiceFly
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                        isCompleted
                          ? "border-[var(--color-success)] bg-[var(--color-success)]"
                          : isCurrent
                          ? "border-[var(--color-accent-purple)] bg-[var(--color-accent-purple-subtle)]"
                          : "border-[var(--color-border-default)] bg-[var(--color-bg-surface)]"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            isCurrent
                              ? "text-[var(--color-accent-purple)]"
                              : "text-[var(--color-text-tertiary)]"
                          )}
                        />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-xs font-medium",
                        isCurrent
                          ? "text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-tertiary)]"
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-4",
                        isCompleted
                          ? "bg-[var(--color-success)]"
                          : "bg-[var(--color-border-default)]"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Tell us about your business
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  This helps us customize your experience
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Business name
                  </label>
                  <Input
                    placeholder="Acme Inc."
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Industry
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {industries.map((industry) => (
                      <button
                        key={industry.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, industry: industry.id })
                        }
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
                          formData.industry === industry.id
                            ? "border-[var(--color-accent-purple)] bg-[var(--color-accent-purple-subtle)]"
                            : "border-[var(--color-border-default)] hover:border-[var(--color-border-strong)]"
                        )}
                      >
                        <span className="text-2xl">{industry.icon}</span>
                        <span className="text-xs font-medium text-[var(--color-text-primary)]">
                          {industry.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Contact details
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  How can customers reach you?
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Business phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Business address
                  </label>
                  <Textarea
                    placeholder="123 Main St, City, State 12345"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  Customize your AI assistant
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Make it yours
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Assistant name
                  </label>
                  <Input
                    placeholder="Maya"
                    value={formData.assistantName}
                    onChange={(e) =>
                      setFormData({ ...formData, assistantName: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Greeting message
                  </label>
                  <Textarea
                    placeholder="Hello! Thank you for calling..."
                    value={formData.assistantGreeting}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assistantGreeting: e.target.value,
                      })
                    }
                    rows={3}
                  />
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    This is what your AI assistant will say when answering calls
                  </p>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
                <p className="text-xs font-medium text-[var(--color-text-tertiary)] mb-2">
                  Preview
                </p>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-purple-subtle)]">
                    <Bot className="h-5 w-5 text-[var(--color-accent-purple)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {formData.assistantName || "Maya"}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {formData.assistantGreeting ||
                        "Hello! Thank you for calling. How can I help you today?"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-[var(--color-border-default)]">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Complete setup
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

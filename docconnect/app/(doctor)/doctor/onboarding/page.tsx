import { OnboardingWizard } from '@/components/OnboardingWizard'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6C3CE1]/5 to-[#00D4C8]/5">
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Set Up Your DocConnect Profile</h1>
          <p className="text-muted-foreground mt-2">Complete your profile to start receiving patients</p>
        </div>
        <OnboardingWizard />
      </div>
    </div>
  )
}

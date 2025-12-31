import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient-shift"></div>
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
            Get Started
          </h1>
          <p className="text-gray-400">Create your account to build AI teams</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-black/50 backdrop-blur-xl border border-white/10",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
              socialButtonsBlockButtonText: "font-medium",
              dividerLine: "bg-white/20",
              dividerText: "text-gray-400",
              formButtonPrimary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-black/30 border-white/20 text-white",
              identityPreviewText: "text-gray-300",
              identityPreviewEditButtonIcon: "text-blue-400",
            },
            layout: {
              socialButtonsVariant: "blockButton",
              socialButtonsPlacement: "top",
            }
          }}
          forceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  )
}
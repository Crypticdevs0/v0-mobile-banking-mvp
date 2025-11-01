"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Upload, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [accountType, setAccountType] = useState<"checking" | "business" | "invest" | "joint" | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    ssn: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    driversLicense: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
    businessName: "",
    ein: "",
    businessType: "",
  })

  const [idFile, setIdFile] = useState<File | null>(null)
  const [livenessFile, setLivenessFile] = useState<File | null>(null)

  const accountTypes = [
    { id: "checking", name: "Premier Checking", desc: "For everyday banking", icon: "💳" },
    { id: "business", name: "Premier Business", desc: "For entrepreneurs", icon: "🏢" },
    { id: "invest", name: "Premier Invest", desc: "For investing", icon: "📈" },
    { id: "joint", name: "Premier Joint", desc: "For shared accounts", icon: "👥" },
  ]

  const steps = [
    { title: "Account Type", subtitle: "Choose your account" },
    { title: "Personal Info", subtitle: "Tell us about yourself" },
    { title: "Contact Details", subtitle: "How we'll reach you" },
    { title: "Address", subtitle: "Where you live" },
    { title: "Verification", subtitle: "Prove your identity" },
    { title: "Security", subtitle: "Create your password" },
    { title: "Review", subtitle: "Confirm your details" },
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleFileUpload = (file: File | null, type: "id" | "liveness") => {
    if (type === "id") setIdFile(file)
    else setLivenessFile(file)
    setError("")
  }

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!accountType) {
          setError("Please select an account type")
          return false
        }
        break
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.dateOfBirth) {
          setError("Please fill all personal info fields")
          return false
        }
        if (!formData.ssn || formData.ssn.length < 9) {
          setError("Please enter a valid SSN")
          return false
        }
        if (accountType === "business" && (!formData.businessName || !formData.ein)) {
          setError("Please enter business name and EIN")
          return false
        }
        break
      case 2:
        if (!formData.email || !formData.phone) {
          setError("Please fill all contact fields")
          return false
        }
        if (!formData.email.includes("@")) {
          setError("Please enter a valid email")
          return false
        }
        break
      case 3:
        if (!formData.address || !formData.city || !formData.state || !formData.zip) {
          setError("Please fill all address fields")
          return false
        }
        break
      case 4:
        if (!idFile || !livenessFile) {
          setError("Please upload both ID and liveness verification")
          return false
        }
        break
      case 5:
        if (!formData.password || !formData.confirmPassword) {
          setError("Please create a password")
          return false
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters")
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords don't match")
          return false
        }
        break
      case 6:
        if (!formData.termsAccepted) {
          setError("Please accept the terms and conditions")
          return false
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    setLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          accountType,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Signup failed")

      localStorage.setItem("authToken", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/auth/otp-verification")
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    const containerVariants = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }

    switch (step) {
      case 0:
        return (
          <motion.div key="step0" variants={containerVariants} className="space-y-4">
            <p className="text-slate-600 mb-6">Select the account type that best fits your needs.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accountTypes.map((type) => (
                <motion.button
                  key={type.id}
                  onClick={() => {
                    setAccountType(type.id as any)
                    setError("")
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-6 border-2 rounded-xl text-left transition ${
                    accountType === type.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="font-bold text-slate-900">{type.name}</div>
                  <div className="text-sm text-slate-600 mt-1">{type.desc}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )
      case 1:
        return (
          <motion.div key="step1" variants={containerVariants} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              />
              <Input
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              />
            </div>
            <Input
              type="date"
              placeholder="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            />
            <Input
              placeholder="SSN (XXX-XX-XXXX)"
              value={formData.ssn}
              onChange={(e) => handleInputChange("ssn", e.target.value)}
            />
            <Input
              placeholder="Driver's License #"
              value={formData.driversLicense}
              onChange={(e) => handleInputChange("driversLicense", e.target.value)}
            />
            {accountType === "business" && (
              <>
                <Input
                  placeholder="Business Name"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange("businessName", e.target.value)}
                />
                <Input
                  placeholder="EIN"
                  value={formData.ein}
                  onChange={(e) => handleInputChange("ein", e.target.value)}
                />
                <Input
                  placeholder="Business Type"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange("businessType", e.target.value)}
                />
              </>
            )}
          </motion.div>
        )
      case 2:
        return (
          <motion.div key="step2" variants={containerVariants} className="space-y-4">
            <Input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </motion.div>
        )
      case 3:
        return (
          <motion.div key="step3" variants={containerVariants} className="space-y-4">
            <Input
              placeholder="Street Address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="City"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
              <Input
                placeholder="State"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
              />
            </div>
            <Input
              placeholder="ZIP Code"
              value={formData.zip}
              onChange={(e) => handleInputChange("zip", e.target.value)}
            />
          </motion.div>
        )
      case 4:
        return (
          <motion.div key="step4" variants={containerVariants} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">ID Document</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">{idFile ? idFile.name : "Upload ID document"}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "id")}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">Liveness Verification</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-600">
                  {livenessFile ? livenessFile.name : "Upload selfie or video"}
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null, "liveness")}
                  className="hidden"
                />
              </label>
            </div>
          </motion.div>
        )
      case 5:
        return (
          <motion.div key="step5" variants={containerVariants} className="space-y-4">
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            />
            <p className="text-xs text-slate-600">Password must be at least 8 characters long</p>
          </motion.div>
        )
      case 6:
        return (
          <motion.div key="step6" variants={containerVariants} className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-6 space-y-3">
              <p>
                <strong>Account Type:</strong> {accountTypes.find((t) => t.id === accountType)?.name}
              </p>
              <p>
                <strong>Name:</strong> {formData.firstName} {formData.lastName}
              </p>
              <p>
                <strong>Email:</strong> {formData.email}
              </p>
              <p>
                <strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zip}
              </p>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => handleInputChange("termsAccepted", e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-slate-600">
                I agree to the{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">Premier America</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Your Account</h1>
          <p className="text-slate-600">
            Step {step + 1} of {steps.length}
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8 space-y-2">
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <motion.div
                key={idx}
                className={`h-1 flex-1 rounded-full ${idx <= step ? "bg-blue-600" : "bg-slate-300"}`}
                layoutId={`progress-${idx}`}
              />
            ))}
          </div>
          <div className="text-center">
            <h2 className="font-semibold text-slate-900">{steps[step].title}</h2>
            <p className="text-sm text-slate-600">{steps[step].subtitle}</p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button onClick={handleBack} variant="outline" disabled={step === 0} className="flex-1 bg-transparent">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button
            onClick={step === steps.length - 1 ? handleSubmit : handleNext}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Creating..." : step === steps.length - 1 ? "Create Account" : "Continue"}
            {step < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}

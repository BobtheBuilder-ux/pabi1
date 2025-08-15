import React, {useState} from "react";
import {Input} from "../../components/ui/input";
import {Button} from "../../components/ui/button";
import {ArrowRight, EyeIcon, EyeOffIcon} from "lucide-react";
import {NavigationBarMainByAnima} from "../LandingPage/sections/NavigationBarMainByAnima";
import {useAuth} from "../../lib/hooks/useAuth";
import {useFormik} from "formik";
import {toast} from "sonner";
import {useNavigate} from "react-router-dom";

interface LoginProps {
  onLogin: (email: string) => void;
}

const LoginPage: React.FC<LoginProps> = ({ onLogin }) => {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = () => {
    navigate("/signup");
    // setIsMobileMenuOpen(false);
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values) => {
      const result = await login(values.email, values.password);

      if (result.success) {
        onLogin(values.email);
        toast.success("Login successful", {
          description: "Welcome back! You have been successfully logged in.",
        });

        // Redirect based on onboarding completion status
        if (result.hasCompletedOnboarding) {
          navigate("/");
        } else {
          console.log("Heading to onboarding", result);
          navigate("/onboarding");
        }
      } else {
        toast.error("Login failed", {
          description: "Please check your credentials and try again.",
        });
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <NavigationBarMainByAnima />

      <div className="flex items-center justify-center min-h-[calc(100vh-73px)] px-4">
        <div className="flex w-full max-w-6xl">
          {/* Left side - Welcome message */}
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold text-[#141b34] mb-6">
                Welcome Back!
              </h1>
              <p className="text-lg text-[#141b34] mb-6">
                Sign in to continue your professional journey
              </p>
              <div className="flex items-center gap-2 text-[#8a358a]">
                <span className="text-sm text-[#141b34]">
                  Don't have an account?
                </span>
                <button
                  onClick={handleSignup}
                  className="flex flex-row items-center gap-2 text-sm font-semibold hover:no-underline"
                >
                  Create account <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center">
            <div className="w-full max-w-lg bg-white/80 border border-[#E4E4E7] backdrop-blur-sm rounded-2xl px-6 lg:px-12 pt-4 lg:pt-20 pb-8 shadow-sm">
              <div className="mb-8 mt-8">
                <h2 className="text-3xl font-bold text-[#141b34] mb-2">
                  Login
                </h2>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                    placeholder="Email"
                  />
                </div>

                <div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      className="w-full px-6 py-8 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#8a358a] focus:border-transparent"
                      placeholder="Password"
                    />
                    <div className="py-2">
                      <button
                        onClick={handleForgotPassword}
                        type="button"
                        className="text-xs text-[#8a358a] hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading || !formik.values.email || !formik.values.password
                  }
                  className="w-full bg-[#8a358a] hover:bg-[#7a2f7a] text-white py-8 rounded-2xl font-semibold transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "→ Login"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                  </div>
                </div>

                <span className="text-xs w-full py-2 rounded-lg flex items-center justify-center gap-2">
                  Continue with LinkedIn
                </span>
              </form>

              {/* Mobile version of "Create account" link */}
              <div className="lg:hidden text-center">
                <div className="flex flex-row items-center justify-center gap-2">
                  <span className="text-xs text-[#141b34]">
                    Don't have an account?
                  </span>
                  <button
                    onClick={handleSignup}
                    className="flex flex-row items-center gap-2 text-xs font-semibold hover:no-underline text-[#8a358a]"
                  >
                    Create account <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState, type FormEvent } from "react"
import { useAuth } from '../../context/authcontext';
import { Link, useNavigate } from "react-router-dom"

export function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confimpassword: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    console.log('🚀 Form submitted with data:', {
      ...formData,
      password: '[REDACTED]',
      confimpassword: '[REDACTED]'
    });

    if (formData.password !== formData.confimpassword) {
      setError("Passwords do not match");
      console.log('❌ Validation failed: Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      console.log('❌ Validation failed: Password too short');
      return;
    }

    if (!formData.username || !formData.email) {
      setError("Please fill in all fields");
      console.log('❌ Validation failed: Missing fields');
      return;
    }

    setIsLoading(true);
    console.log('⏳ Sending signup request...');

    try {
      const response = await signup(formData);
      console.log('📥 Signup response received:', response);
      
      if (response.success) {
        console.log('✅ Signup successful! Redirecting to login...');
        navigate("/auth/login");
      } else {
        console.log('❌ Signup failed:', response.message);
        setError(response.message);
      }
    } catch (err) {
      console.error('💥 Signup error caught:', err);
      setError("An unexpected error occurred. Check console for details.");
    } finally {
      setIsLoading(false);
      console.log('⏹️ Signup process completed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <div className="flex items-center justify-center py-10 _bg-gradient-to-b from-[#6a83de] to-[#3b425c]">
      <Card className="flex flex-col gap-6 w-100">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="username">User Name</FieldLabel>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="John Doe" 
                  value={formData.username} 
                  onChange={handleChange} 
                  required 
                />
              </Field>
              
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your email
                  with anyone else.
                </FieldDescription>
              </Field>
              
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              
              <Field>
                <FieldLabel htmlFor="confimpassword">
                  Confirm Password
                </FieldLabel>
                <Input 
                  id="confimpassword" 
                  type="password" 
                  required 
                  value={formData.confimpassword} 
                  onChange={handleChange} 
                />
                <FieldDescription>Please confirm your password.</FieldDescription>
              </Field>
              
              <FieldGroup>
                <Field>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    Sign up with Google
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account? <Link to="/auth/login">Sign in</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

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
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input"
import { Link, useNavigate } from "react-router-dom"
import { useState, type FormEvent } from "react"
import { useAuth } from "../../context/authcontext"

export default function LoginForm() {
  const navigate = useNavigate();
  const {login} = useAuth();
  const [showPassword,setShowPassword] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [_error, setError] = useState("");
  const [_isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login(formData);
      
      if (response.success) {
        navigate("/home"); 
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };
  
  return (
<div className="flex items-center justify-center min-h-screen _bg-gradient-to-b from-[#6a83de] to-[#3b425c]">
    <div className="flex flex-col gap-6 xl:w-100 w-100">
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field className="relative w-full">
                <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required  className="pr-10"  />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-80  top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <Link to={"/auth/signup"}>signup</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
</div>
  )
}

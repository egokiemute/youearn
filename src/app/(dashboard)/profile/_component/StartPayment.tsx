"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/Axios";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

// Custom error type for more precise error handling
interface CustomError {
  response?: {
    data?: {
      error?: string;
    };
    status?: number;
  };
  message?: string;
}

// Make sure to add your Stripe publishable key here
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

// Define fee types with their corresponding prices
interface FeeOption {
  id: string;
  name: string;
  price: number;
}

const feeOptions: FeeOption[] = [
  { id: "schoolFee", name: "School Fee", price: 500 },
  { id: "acceptanceFee", name: "Acceptance Fee", price: 250 },
  { id: "admissionFee", name: "Admission Fee", price: 350 },
];

// Available semesters
const levels = [
  { id: "2023-first", name: "First Semester 2023/2024" },
  { id: "2023-second", name: "Second Semester 2023/2024" },
  { id: "2024-first", name: "First Semester 2024/2025" },
];

// Format price as currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Interface matching our mongoose model
interface PaymentFormData {
  studentName: string;
  studentId: string;
  amount: number;
  currency: string;
  feeType: string;
  level: string;
  paymentMethod: string;
}

interface FormErrors {
  studentName: string;
  studentId: string;
  feeType: string;
  level: string;
}

const StartPayment = () => {
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
    studentName: "",
    studentId: "",
    amount: 0,
    currency: "USD", // Changed from NGN to USD
    feeType: "",
    level: "",
    paymentMethod: "stripe"
  });
  
  // Form errors state
  const [errors, setErrors] = useState<FormErrors>({
    studentName: "",
    studentId: "",
    feeType: "",
    level: ""
  });
  
  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Dialog open state
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Get the selected fee option
  const selectedFee = feeOptions.find(fee => fee.id === formData.feeType);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name as keyof typeof errors]: "",
      });
    }
  };
  
  // Handle select changes for fee type
  const handleFeeTypeChange = (value: string) => {
    const selectedFee = feeOptions.find(fee => fee.id === value);
    
    setFormData(prevFormData => ({
      ...prevFormData,
      feeType: value,
      amount: selectedFee?.price || 0
    }));
    
    // Clear error when user selects an option
    setErrors(prevErrors => ({
      ...prevErrors,
      feeType: "",
    }));
  };
  
  // Handle select changes for semester
  const handleSemesterChange = (value: string) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      level: value
    }));
    
    // Clear error when user selects an option
    setErrors(prevErrors => ({
      ...prevErrors,
      level: "",
    }));
  };
  
  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = { ...errors };
    
    if (!formData.studentName.trim()) {
      newErrors.studentName = "Full name is required";
      isValid = false;
    }
    
    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
      isValid = false;
    }
    
    if (!formData.feeType) {
      newErrors.feeType = "Fee type is required";
      isValid = false;
    }
    
    if (!formData.level) {
      newErrors.level = "Semester is required";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Create a payment intent on your server
      const response = await axiosInstance.post("/api/payment/create-intent", {
        studentId: formData.studentId,
        studentName: formData.studentName,
        amount: formData.amount,
        currency: formData.currency,
        feeType: selectedFee?.name || "",
        level: levels.find(s => s.id === formData.level)?.name || "",
        paymentMethod: formData.paymentMethod
      });

      if (response.status === 200 && response.data.sessionId) {
        // Redirect to Stripe Checkout
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({
            sessionId: response.data.sessionId
          });
          
          if (error) {
            console.error("Stripe redirect error:", error);
            toast.error(error.message || "Failed to redirect to payment page");
          }
        } else {
          toast.error("Failed to initialize Stripe. Please try again.");
        }
      } else {
        // Handle payment intent creation error
        toast.error("Failed to create payment session. Please try again.");
      }
      
    } catch (error: unknown) {
      // Type-safe error handling
      const processedError = error as CustomError;
      console.error("Payment error:", processedError);
      
      // Extract and display more helpful error messages
      const errorMessage = 
        processedError.response?.data?.error || 
        processedError.message || 
        "Failed to process payment. Please try again.";
        
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"elevated"}
          className={cn(
            "bg-green-600 border-0 text-white hover:text-black rounded-sm border-transparent hover:border-white hover:bg-white px-10 py-6 text-lg transition-all duration-300 ease-in-out w-fit"
          )}
        >
          Make a Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Payment Details</DialogTitle>
          <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
            <div>
              <Input 
                placeholder="Full Name" 
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                className={errors.studentName ? "border-red-500" : ""}
              />
              {errors.studentName && (
                <p className="text-red-500 text-sm mt-1">{errors.studentName}</p>
              )}
            </div>
            <div>
              <Input 
                placeholder="Student ID" 
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className={errors.studentId ? "border-red-500" : ""}
              />
              {errors.studentId && (
                <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
              )}
            </div>
            <div>
              <Select 
                value={formData.feeType} 
                onValueChange={handleFeeTypeChange}
              >
                <SelectTrigger className={cn("w-full", errors.feeType ? "border-red-500" : "")}>
                  <SelectValue placeholder="Fee Type" />
                </SelectTrigger>
                <SelectContent>
                  {feeOptions.map(fee => (
                    <SelectItem key={fee.id} value={fee.id}>
                      {fee.name} - {formatCurrency(fee.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.feeType && (
                <p className="text-red-500 text-sm mt-1">{errors.feeType}</p>
              )}
            </div>
            
            <div>
              <Select 
                value={formData.level} 
                onValueChange={handleSemesterChange}
              >
                <SelectTrigger className={cn("w-full", errors.level ? "border-red-500" : "")}>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map(level => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-red-500 text-sm mt-1">{errors.level}</p>
              )}
            </div>

            {selectedFee && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-800">Payment Summary</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600">{selectedFee.name}</span>
                  <span className="font-semibold text-lg text-blue-700">
                    {formatCurrency(selectedFee.price)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Semester</span>
                  <span className="text-gray-700">
                    {levels.find(s => s.id === formData.level)?.name || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="text-gray-700">Stripe</span>
                </div>
              </div>
            )}

            <Button
              disabled={isLoading}
              variant="elevated"
              className="bg-blue-600 text-white font-semibold w-full cursor-pointer flex items-center justify-center"
              type="submit"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                `Pay ${selectedFee ? formatCurrency(selectedFee.price) : "Now"}`
              )}
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default StartPayment;
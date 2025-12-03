import { z } from "zod"

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  mobileNo: z.string().min(10, "Mobile number must be at least 10 digits").optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const transferSchema = z.object({
  recipientAccountId: z.string().min(1, "Recipient account ID is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().optional(),
})

export const depositSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().optional(),
})

export const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  description: z.string().optional(),
})

export function validateRequest(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body)
      req.body = validated
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        })
      }
      res.status(400).json({ error: "Invalid request format" })
    }
  }
}

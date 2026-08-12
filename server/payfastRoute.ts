import type { Express, Request, Response } from "express";
import { handlePayFastItn } from "./payfast";

export function registerPayFastRoutes(app: Express) {
  app.post("/api/payfast/itn", async (req: Request, res: Response) => {
    try {
      await handlePayFastItn(req.body as Record<string, string | undefined>);
      res.status(200).send("OK");
    } catch (error) {
      console.warn("[PayFast] ITN rejected:", error instanceof Error ? error.message : "unknown error");
      res.status(400).send("Invalid PayFast notification");
    }
  });
}

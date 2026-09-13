import { Router } from "express";
import type { Request, Response } from "express";
import { GivingValidationError, getAllocation, listPublishedCharities, saveAllocation } from "./giving.service";

export const givingRouter = Router();

givingRouter.get("/charities", async (_req: Request, res: Response) => {
  const charities = await listPublishedCharities();
  res.json({ charities });
});

givingRouter.get("/admin/charities", async (_req: Request, res: Response) => {
  const charities = await listPublishedCharities();
  res.json({ charities });
});

givingRouter.post("/allocations", async (req: Request, res: Response) => {
  try {
    const allocation = await saveAllocation(req.body ?? {});
    res.json({ allocation });
  } catch (err) {
    if (err instanceof GivingValidationError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
});

givingRouter.get("/allocations/:clientId", async (req: Request, res: Response) => {
  const allocation = await getAllocation(req.params.clientId);
  if (!allocation) {
    res.status(404).json({ error: "No saved allocation yet" });
    return;
  }
  res.json({ allocation });
});

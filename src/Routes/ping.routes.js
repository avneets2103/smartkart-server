import { Router } from "express";
import { ping } from "../Controllers/ping.controller.js";

const router = Router();
router.route("/ping").get(ping);

export default router;
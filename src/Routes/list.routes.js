import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { addNewList, deleteAllLists, deleteList, getListArray } from "../Controllers/list.controller.js";

const router = Router();

router.route("/addNewList").post(verifyJWT, addNewList);
router.route("/getListArray").post(verifyJWT, getListArray);
router.route("/deleteList").post(verifyJWT, deleteList);
router.route("/deleteAllLists").post(verifyJWT, deleteAllLists);

export default router;
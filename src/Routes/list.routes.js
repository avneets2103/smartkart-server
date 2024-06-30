import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js";
import { addNewList, addProductToList, deleteAllLists, deleteList, getListArray, trial, getListData } from "../Controllers/list.controller.js";

const router = Router();

router.route("/addNewList").post(verifyJWT, addNewList);
router.route("/getListArray").post(verifyJWT, getListArray);
router.route("/deleteList").post(verifyJWT, deleteList);
router.route("/deleteAllLists").post(verifyJWT, deleteAllLists);
router.route("/addProductToList").post(verifyJWT, addProductToList);
router.route("/getListData").post(verifyJWT, getListData);
router.route("/trial").get(verifyJWT, trial);

export default router;
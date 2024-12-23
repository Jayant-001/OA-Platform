import { Router } from "express";
import TagController from "../controllers/tagController";

const router = Router();
const tagController = new TagController();
router.get('/', tagController.getTags);
router.post("/", tagController.createTag);
//router.get("/:tagId", tagController.getTagById);
router.put("/:tagId", tagController.updateTag);
router.delete("/:tagId", tagController.deleteTag);

export default router;

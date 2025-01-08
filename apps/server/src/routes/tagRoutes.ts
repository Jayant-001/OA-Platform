import { Router } from "express";
import TagController from "../controllers/tagController";
import { asyncWrapper } from "../utils/asyncWrapper";

const router = Router();
const tagController = new TagController();

router.get('/', asyncWrapper(tagController.getTags));
router.post("/", asyncWrapper(tagController.createTag));
//router.get("/:tagId", tagController.getTagById);
router.put("/:tagId", asyncWrapper(tagController.updateTag));
router.delete("/:tagId", asyncWrapper(tagController.deleteTag));

export default router;

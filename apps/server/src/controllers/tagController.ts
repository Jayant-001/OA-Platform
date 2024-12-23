import { Request, Response, NextFunction } from "express";
import { TagService } from "../services/tagService";

class TagController {
    private tagService: TagService;

    constructor() {
        this.tagService = new TagService();
    }

    createTag = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tag = await this.tagService.createTag(req.body.name);
            res.status(201).json(tag);
        } catch (error) {
            next(error);
        }
    };

    getTags = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tags = await this.tagService.getTags();
            res.status(200).json(tags);
        } catch (error) {
            next(error);
        }
    };

    getTagById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tag = await this.tagService.getTagById(req.params.tagId);
            res.status(200).json(tag);
        } catch (error) {
            next(error);
        }
    };

    updateTag = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.tagService.updateTag(req.params.tagId, req.body);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    deleteTag = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.tagService.deleteTag(req.params.tagId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
}

export default TagController;

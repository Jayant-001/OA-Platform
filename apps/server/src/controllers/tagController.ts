import { Request, Response, NextFunction } from "express";
import { TagService } from "../services/tagService";

class TagController {
    private tagService: TagService;

    constructor() {
        this.tagService = new TagService();
    }

    createTag = async (req: Request, res: Response) => {
            const tag = await this.tagService.createTag(req.body);
            res.status(201).json(tag);
       
    };

    getTags = async (req: Request, res: Response) => {
            const tags = await this.tagService.getTags();
            res.status(200).json(tags);
        
    };

    getTagById = async (req: Request, res: Response) => {
            const tag = await this.tagService.getTagById(req.params.tagId);
            res.status(200).json(tag);
        
    };

    updateTag = async (req: Request, res: Response) => {
            await this.tagService.updateTag(req.params.tagId, req.body);
            res.status(204).send();
       
    };

    deleteTag = async (req: Request, res: Response) => {
            await this.tagService.deleteTag(req.params.tagId);
            res.status(204).send();
       
    };

    // async getTagsByProblemId (req: Request, res: Response) {
    //     try {
    //         const tags = this.tagService
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}

export default TagController;
